'use client'

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CartItem,
  getDbCart,
  mergeGuestCartIntoDb,
  syncCartItemToDb,
  clearDbCart,
} from '@/app/cart/actions'
import {
  cartReducer,
  calculateTotalItems,
  calculateSubtotalCents,
} from '@/lib/cart'

const GUEST_CART_KEY = 'intern_shop_guest_cart'

type CartContextValue = {
  items: CartItem[]
  isLoaded: boolean
  isLoggedIn: boolean
  totalItems: number
  subtotal: number
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function readGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeGuestCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
  } catch {
    // Ignore storage quota errors
  }
}

function clearGuestCartStorage() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(GUEST_CART_KEY)
  } catch {
    // Ignore
  }
}

export function CartProvider({
  children,
  initialUserId,
}: {
  children: React.ReactNode
  initialUserId: string | null
}) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoaded: false,
  })
  const [userId, setUserId] = useState<string | null>(initialUserId)
  const [prevInitialUserId, setPrevInitialUserId] = useState<string | null>(
    initialUserId
  )

  if (initialUserId !== prevInitialUserId) {
    setPrevInitialUserId(initialUserId)
    setUserId(initialUserId)
  }

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let active = true

    async function initCart() {
      if (userId) {
        const guestItems = readGuestCart()
        if (guestItems.length > 0) {
          const merged = await mergeGuestCartIntoDb(
            guestItems.map((i) => ({
              product_id: i.product_id,
              quantity: i.quantity,
            }))
          )
          clearGuestCartStorage()
          if (active) dispatch({ type: 'SET_CART', payload: merged })
        } else {
          const dbItems = await getDbCart()
          if (active) dispatch({ type: 'SET_CART', payload: dbItems })
        }
      } else {
        const guestItems = readGuestCart()
        if (active) dispatch({ type: 'SET_CART', payload: guestItems })
      }
    }

    initCart()
    return () => {
      active = false
    }
  }, [userId])

  useEffect(() => {
    if (!state.isLoaded || userId) return
    writeGuestCart(state.items)
  }, [state.items, state.isLoaded, userId])

  const addItem = useCallback(
    (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
      if (product.stock <= 0) return
      const existing = state.items.find(
        (i) => i.product_id === product.product_id
      )
      const nextQty = Math.min(
        (existing?.quantity ?? 0) + quantity,
        product.stock
      )

      dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } })

      if (userId) {
        void syncCartItemToDb(product.product_id, nextQty)
      }
    },
    [state.items, userId]
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const existing = state.items.find((i) => i.product_id === productId)
      if (!existing) return

      const clampedQty = quantity <= 0 ? 0 : Math.min(quantity, existing.stock)
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { product_id: productId, quantity: clampedQty },
      })

      if (userId) {
        void syncCartItemToDb(productId, clampedQty)
      }
    },
    [state.items, userId]
  )

  const removeItem = useCallback(
    (productId: string) => {
      dispatch({ type: 'REMOVE_ITEM', payload: { product_id: productId } })
      if (userId) {
        void syncCartItemToDb(productId, 0)
      }
    },
    [userId]
  )

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
    if (userId) {
      void clearDbCart()
    } else {
      clearGuestCartStorage()
    }
  }, [userId])

  const totalItems = calculateTotalItems(state.items)
  const subtotal = calculateSubtotalCents(state.items)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isLoaded: state.isLoaded,
        isLoggedIn: Boolean(userId),
        totalItems,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
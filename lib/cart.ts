import type { CartItem } from '@/app/cart/actions'
import { FIXED_DELIVERY_CHARGE_CENTS } from '@/lib/validations/checkout'

export type CartState = {
  items: CartItem[]
  isLoaded: boolean
}

export type CartAction =
  | { type: 'SET_CART'; payload: CartItem[] }
  | {
      type: 'ADD_ITEM'
      payload: Omit<CartItem, 'quantity'> & { quantity?: number }
    }
  | {
      type: 'UPDATE_QUANTITY'
      payload: { product_id: string; quantity: number }
    }
  | { type: 'REMOVE_ITEM'; payload: { product_id: string } }
  | { type: 'CLEAR_CART' }

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART':
      return { items: action.payload, isLoaded: true }

    case 'ADD_ITEM': {
      const { quantity = 1, ...product } = action.payload
      if (product.stock <= 0) return state

      const existing = state.items.find(
        (i) => i.product_id === product.product_id
      )
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stock)
        return {
          ...state,
          items: state.items.map((i) =>
            i.product_id === product.product_id
              ? {
                  ...i,
                  stock: product.stock,
                  price: product.price,
                  quantity: nextQty,
                }
              : i
          ),
        }
      }

      const initialQty = Math.min(Math.max(1, quantity), product.stock)
      return {
        ...state,
        items: [...state.items, { ...product, quantity: initialQty }],
      }
    }

    case 'UPDATE_QUANTITY': {
      const { product_id, quantity } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product_id !== product_id),
        }
      }

      return {
        ...state,
        items: state.items.map((i) =>
          i.product_id === product_id
            ? { ...i, quantity: Math.min(quantity, i.stock) }
            : i
        ),
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (i) => i.product_id !== action.payload.product_id
        ),
      }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    default:
      return state
  }
}

export function calculateTotalItems(items: Pick<CartItem, 'quantity'>[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function calculateSubtotalCents(
  items: Pick<CartItem, 'price' | 'quantity'>[]
): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateOrderTotalsCents(
  items: Pick<CartItem, 'price' | 'quantity'>[],
  deliveryChargeCents = FIXED_DELIVERY_CHARGE_CENTS
) {
  const subtotal = calculateSubtotalCents(items)
  const delivery = items.length > 0 ? deliveryChargeCents : 0
  const total = subtotal + delivery

  return { subtotal, delivery, total }
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
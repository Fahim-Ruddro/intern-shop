import { describe, expect, it } from 'vitest'
import {
  cartReducer,
  calculateTotalItems,
  calculateSubtotalCents,
  calculateOrderTotalsCents,
  dollarsToCents,
  formatCents,
  type CartState,
} from '@/lib/cart'
import type { CartItem } from '@/app/cart/actions'

const sampleTee: Omit<CartItem, 'quantity'> = {
  product_id: 'prod-1',
  name: 'Classic Cotton Tee',
  slug: 'classic-cotton-tee',
  price: 2500, // $25.00
  image: 'https://example.com/tee.jpg',
  stock: 5,
}

const sampleMug: Omit<CartItem, 'quantity'> = {
  product_id: 'prod-2',
  name: 'Developer Mug',
  slug: 'developer-mug',
  price: 1450, // $14.50
  image: null,
  stock: 2,
}

describe('cartReducer', () => {
  const emptyState: CartState = { items: [], isLoaded: false }

  it('sets initial cart items and marks isLoaded true on SET_CART', () => {
    const next = cartReducer(emptyState, {
      type: 'SET_CART',
      payload: [{ ...sampleTee, quantity: 2 }],
    })

    expect(next.isLoaded).toBe(true)
    expect(next.items).toHaveLength(1)
    expect(next.items[0].quantity).toBe(2)
  })

  it('adds a new item and clamps initial quantity to available stock', () => {
    const next = cartReducer(emptyState, {
      type: 'ADD_ITEM',
      payload: { ...sampleMug, quantity: 10 },
    })

    expect(next.items).toHaveLength(1)
    expect(next.items[0].quantity).toBe(2) // clamped to stock = 2
  })

  it('ignores ADD_ITEM when product stock is 0', () => {
    const next = cartReducer(emptyState, {
      type: 'ADD_ITEM',
      payload: { ...sampleTee, stock: 0, quantity: 1 },
    })

    expect(next.items).toHaveLength(0)
  })

  it('merges duplicate ADD_ITEM calls and caps at stock', () => {
    const state1 = cartReducer(emptyState, {
      type: 'ADD_ITEM',
      payload: { ...sampleTee, quantity: 3 },
    })
    const state2 = cartReducer(state1, {
      type: 'ADD_ITEM',
      payload: { ...sampleTee, quantity: 4 },
    })

    expect(state2.items).toHaveLength(1)
    expect(state2.items[0].quantity).toBe(5) // capped at stock = 5
  })

  it('updates item quantity and clamps to stock', () => {
    const state1: CartState = {
      isLoaded: true,
      items: [{ ...sampleTee, quantity: 1 }],
    }

    const updated = cartReducer(state1, {
      type: 'UPDATE_QUANTITY',
      payload: { product_id: 'prod-1', quantity: 99 },
    })

    expect(updated.items[0].quantity).toBe(5)
  })

  it('removes the item when UPDATE_QUANTITY is 0 or negative', () => {
    const state1: CartState = {
      isLoaded: true,
      items: [
        { ...sampleTee, quantity: 2 },
        { ...sampleMug, quantity: 1 },
      ],
    }

    const updated = cartReducer(state1, {
      type: 'UPDATE_QUANTITY',
      payload: { product_id: 'prod-1', quantity: 0 },
    })

    expect(updated.items).toHaveLength(1)
    expect(updated.items[0].product_id).toBe('prod-2')
  })

  it('removes a specific item on REMOVE_ITEM', () => {
    const state1: CartState = {
      isLoaded: true,
      items: [
        { ...sampleTee, quantity: 2 },
        { ...sampleMug, quantity: 1 },
      ],
    }

    const updated = cartReducer(state1, {
      type: 'REMOVE_ITEM',
      payload: { product_id: 'prod-2' },
    })

    expect(updated.items).toHaveLength(1)
    expect(updated.items[0].product_id).toBe('prod-1')
  })

  it('empties all items on CLEAR_CART while preserving isLoaded', () => {
    const state1: CartState = {
      isLoaded: true,
      items: [{ ...sampleTee, quantity: 2 }],
    }

    const cleared = cartReducer(state1, { type: 'CLEAR_CART' })
    expect(cleared.items).toEqual([])
    expect(cleared.isLoaded).toBe(true)
  })
})

describe('price and cart total calculations', () => {
  it('calculates total item count across multiple line items', () => {
    const items = [
      { ...sampleTee, quantity: 2 },
      { ...sampleMug, quantity: 3 },
    ]
    expect(calculateTotalItems(items)).toBe(5)
  })

  it('calculates exact subtotal in cents', () => {
    const items = [
      { ...sampleTee, quantity: 2 }, // 5000
      { ...sampleMug, quantity: 1 }, // 1450
    ]
    expect(calculateSubtotalCents(items)).toBe(6450)
  })

  it('adds fixed delivery charge to non-empty orders and returns 0 for empty carts', () => {
    const nonEmpty = calculateOrderTotalsCents([{ ...sampleTee, quantity: 2 }])
    expect(nonEmpty).toEqual({
      subtotal: 5000,
      delivery: 500,
      total: 5500,
    })

    const empty = calculateOrderTotalsCents([])
    expect(empty).toEqual({
      subtotal: 0,
      delivery: 0,
      total: 0,
    })
  })

  it('converts floating-point dollars to integer cents without precision drift', () => {
    expect(dollarsToCents(19.99)).toBe(1999)
    expect(dollarsToCents(0.5)).toBe(50)
  })

  it('formats cents into USD currency strings', () => {
    expect(formatCents(0)).toBe('$0.00')
    expect(formatCents(6450)).toBe('$64.50')
  })
})
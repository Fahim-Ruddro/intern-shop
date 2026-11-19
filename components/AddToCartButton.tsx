'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'

export default function AddToCartButton({
  product,
}: {
  product: {
    id: string
    name: string
    slug: string
    price: number
    image: string | null
    stock: number
  }
}) {
  const { items, addItem } = useCart()
  const [added, setAdded] = useState(false)

  const existingItem = items.find((i) => i.product_id === product.id)
  const currentInCart = existingItem?.quantity ?? 0
  const remainingStock = Math.max(0, product.stock - currentInCart)
  const isOutOfStock = product.stock <= 0
  const isMaxReached = !isOutOfStock && remainingStock === 0

  const handleAdd = () => {
    if (isOutOfStock || isMaxReached) return
    addItem(
      {
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      1
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleAdd}
        disabled={isOutOfStock || isMaxReached}
        className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isOutOfStock
          ? 'Out of Stock'
          : isMaxReached
            ? `Max Stock in Cart (${product.stock})`
            : added
              ? 'Added to Cart ✓'
              : 'Add to Cart'}
      </button>

      {currentInCart > 0 && (
        <p className="text-xs text-gray-500">
          {currentInCart} in cart ({remainingStock} more available)
        </p>
      )}
    </div>
  )
}
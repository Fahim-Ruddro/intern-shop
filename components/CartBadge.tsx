'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartBadge() {
  const { totalItems, isLoaded } = useCart()

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
    >
      <span>Cart</span>
      {isLoaded && totalItems > 0 && (
        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold rounded-full bg-black dark:bg-white text-white dark:text-black">
          {totalItems}
        </span>
      )}
    </Link>
  )
}
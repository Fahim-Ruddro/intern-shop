'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleWishlistItem } from '@/app/products/[slug]/actions'

export default function WishlistButton({
  productId,
  initialWishlisted,
  revalidateTarget,
  variant = 'button',
}: {
  productId: string
  initialWishlisted: boolean
  revalidateTarget: string
  variant?: 'button' | 'icon'
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      const res = await toggleWishlistItem(productId, revalidateTarget)
      if (res?.requiresAuth) {
        router.push(`/login?next=${encodeURIComponent(revalidateTarget)}`)
        return
      }
      if (typeof res?.wishlisted === 'boolean') {
        setWishlisted(res.wishlisted)
        router.refresh()
      }
    })
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-pressed={wishlisted}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border backdrop-blur-sm transition-all ${
          wishlisted
            ? 'bg-white/95 dark:bg-black/90 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
            : 'bg-white/90 dark:bg-black/80 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400'
        }`}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {wishlisted ? '♥' : '♡'}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border font-medium transition-colors ${
        wishlisted
          ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
          : 'border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white'
      }`}
    >
      <span aria-hidden="true">{wishlisted ? '♥' : '♡'}</span>
      <span>{wishlisted ? 'Saved' : 'Wishlist'}</span>
    </button>
  )
}
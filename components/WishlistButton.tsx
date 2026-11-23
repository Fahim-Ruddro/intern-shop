'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleWishlistItem } from '@/app/products/[slug]/actions'

export default function WishlistButton({
  productId,
  initialWishlisted,
  revalidateTarget,
}: {
  productId: string
  initialWishlisted: boolean
  revalidateTarget: string
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleWishlistItem(productId, revalidateTarget)
      if (res?.requiresAuth) {
        router.push(`/login?next=${encodeURIComponent(revalidateTarget)}`)
        return
      }
      if (typeof res?.wishlisted === 'boolean') {
        setWishlisted(res.wishlisted)
      }
    })
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
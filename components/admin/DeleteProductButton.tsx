'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProduct } from '@/app/admin/products/actions'

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string
  productName: string
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`
    )
    if (!confirmed) return

    startTransition(async () => {
      try {
        await deleteProduct(productId)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete product.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:underline font-medium disabled:opacity-50"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
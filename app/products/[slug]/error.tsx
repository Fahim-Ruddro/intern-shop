'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Product route error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h2 className="text-3xl font-bold text-red-600 mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-8">We encountered an unexpected error loading this product.</p>
      <button
        onClick={() => reset()}
        className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
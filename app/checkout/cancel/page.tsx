import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center space-y-5">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-2xl font-bold">
        !
      </div>
      <h1 className="text-3xl font-bold">Payment Canceled</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Your payment was not completed. Your items are still saved in your cart whenever you&apos;re ready.
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          href="/checkout"
          className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Try Checkout Again
        </Link>
        <Link
          href="/cart"
          className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          Back to Cart
        </Link>
      </div>
    </div>
  )
}
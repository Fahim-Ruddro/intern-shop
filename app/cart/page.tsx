'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const {
    items,
    isLoaded,
    isLoggedIn,
    subtotal,
    updateQuantity,
    removeItem,
  } = useCart()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-28 bg-gray-100 dark:bg-gray-900 rounded-xl" />
          <div className="h-28 bg-gray-100 dark:bg-gray-900 rounded-xl" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-sm text-gray-500">
          Looks like you haven&apos;t added any items yet. Browse the shop to find something you like.
        </p>
        <Link
          href="/search"
          className="inline-block px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const atMaxStock = item.quantity >= item.stock
            const imageUrl = item.image
              ? `${supabaseUrl}/storage/v1/object/public/product-images/${item.image}`
              : null

            return (
              <div
                key={item.product_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100 dark:bg-gray-900 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-xs text-gray-400 shrink-0">
                      No image
                    </div>
                  )}

                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-semibold hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      ${(item.price / 100).toFixed(2)} each
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      In stock: {item.stock}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-900 rounded-l-lg"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-semibold min-w-10 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={atMaxStock}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-900 rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-20">
                    <p className="font-semibold">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product_id)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="text-xs text-red-600 hover:underline mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Cart Summary Box */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 h-fit space-y-4">
          <h2 className="text-lg font-bold">Order Summary</h2>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              ${(subtotal / 100).toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Delivery charge is calculated at checkout.
          </p>

          {isLoggedIn ? (
            <Link
              href="/checkout"
              className="block w-full text-center bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Proceed to Checkout
            </Link>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login?next=/checkout"
                className="block w-full text-center bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Log in to Checkout
              </Link>
              <p className="text-xs text-center text-gray-500">
                Your guest cart will automatically merge when you log in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
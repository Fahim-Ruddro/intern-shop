'use client'

import { useActionState } from 'react'
import {
  createCheckoutSession,
  CheckoutActionState,
} from '@/app/checkout/actions'
import { CartItem } from '@/app/cart/actions'
import { FIXED_DELIVERY_CHARGE_CENTS } from '@/lib/validations/checkout'

type SavedAddress = {
  id: string
  name: string
  phone: string
  address: string
  city: string
  area: string
}

export default function CheckoutForm({
  items,
  defaultAddress,
}: {
  items: CartItem[]
  defaultAddress: Partial<SavedAddress> | null
}) {
  const initialState: CheckoutActionState = {}
  const [state, formAction, isPending] = useActionState(
    createCheckoutSession,
    initialState
  )

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const total = subtotal + FIXED_DELIVERY_CHARGE_CENTS

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Shipping Address Form */}
      <div className="lg:col-span-2 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-5">
        <h2 className="text-xl font-bold">Delivery Address</h2>

        {state.error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={defaultAddress?.name ?? ''}
              placeholder="Jane Doe"
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            {state.fieldErrors?.name?.[0] && (
              <p className="text-xs text-red-600 mt-1">
                {state.fieldErrors.name[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={defaultAddress?.phone ?? ''}
              placeholder="+1 555 234 5678"
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            {state.fieldErrors?.phone?.[0] && (
              <p className="text-xs text-red-600 mt-1">
                {state.fieldErrors.phone[0]}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Street Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={defaultAddress?.address ?? ''}
            placeholder="123 Main St, Apt 4B"
            className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          />
          {state.fieldErrors?.address?.[0] && (
            <p className="text-xs text-red-600 mt-1">
              {state.fieldErrors.address[0]}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={defaultAddress?.city ?? ''}
              placeholder="New York"
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            {state.fieldErrors?.city?.[0] && (
              <p className="text-xs text-red-600 mt-1">
                {state.fieldErrors.city[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="area" className="block text-sm font-medium mb-1">
              Area / District
            </label>
            <input
              id="area"
              name="area"
              type="text"
              defaultValue={defaultAddress?.area ?? ''}
              placeholder="Manhattan"
              className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            {state.fieldErrors?.area?.[0] && (
              <p className="text-xs text-red-600 mt-1">
                {state.fieldErrors.area[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Server-Verified Order Summary */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 h-fit space-y-4">
        <h2 className="text-lg font-bold">Order Summary</h2>

        <div className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="py-2.5 flex items-center justify-between gap-2"
            >
              <span className="text-gray-700 dark:text-gray-300">
                {item.name}{' '}
                <span className="text-gray-400">× {item.quantity}</span>
              </span>
              <span className="font-medium shrink-0">
                ${((item.price * item.quantity) / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span>${(subtotal / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Delivery Charge (Fixed)</span>
            <span>${(FIXED_DELIVERY_CHARGE_CENTS / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-800">
            <span>Total</span>
            <span>${(total / 100).toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Redirecting to Stripe...' : 'Pay with Stripe'}
        </button>
      </div>
    </form>
  )
}
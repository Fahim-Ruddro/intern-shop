'use client'

import { useActionState } from 'react'
import {
  updateOrderStatus,
  type OrderActionState,
  type OrderStatus,
} from '@/app/admin/orders/actions'

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
]

const initialState: OrderActionState = {}

export default function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const updateWithId = updateOrderStatus.bind(null, orderId)
  const [state, formAction, isPending] = useActionState(updateWithId, initialState)

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <select
          name="status"
          defaultValue={currentStatus}
          className="px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-sm capitalize"
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Updating...' : 'Update Status'}
        </button>
      </div>

      {state.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      {state.message && (
        <p className="text-xs text-green-600">{state.message}</p>
      )}
    </form>
  )
}
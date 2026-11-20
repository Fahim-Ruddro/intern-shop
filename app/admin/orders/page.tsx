import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/admin'

const VALID_STATUSES = [
  'all',
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
] as const

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

type ShippingAddress = {
  name?: string
  phone?: string
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { supabase } = await requireAdmin('/admin/orders')
  const { status = 'all' } = await searchParams

  const activeStatus = VALID_STATUSES.includes(
    status as (typeof VALID_STATUSES)[number]
  )
    ? status
    : 'all'

  let query = supabase
    .from('orders')
    .select(
      'id, status, total, shipping_address, created_at, order_items(id)'
    )
    .order('created_at', { ascending: false })

  if (activeStatus !== 'all') {
    query = query.eq('status', activeStatus)
  }

  const { data: orders } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-gray-500">
          Review customer orders and update fulfillment status.
        </p>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {VALID_STATUSES.map((s) => {
          const isActive = activeStatus === s
          return (
            <Link
              key={s}
              href={s === 'all' ? '/admin/orders' : `/admin/orders?status=${s}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              {s}
            </Link>
          )
        })}
      </div>

      {/* Orders Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto">
        {!orders || orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">
            No orders found for status &ldquo;{activeStatus}&rdquo;.
          </p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {orders.map((order) => {
                const shipping = (order.shipping_address || {}) as ShippingAddress
                const itemCount = Array.isArray(order.order_items)
                  ? order.order_items.length
                  : 0
                const badgeClass =
                  STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'

                return (
                  <tr key={order.id}>
                    <td className="px-5 py-3 font-mono text-xs font-semibold">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{shipping.name || 'Customer'}</p>
                      <p className="text-xs text-gray-500">{shipping.phone || ''}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3">{itemCount}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${badgeClass}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold">
                      ${(order.total / 100).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
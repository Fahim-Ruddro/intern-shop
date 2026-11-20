import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account/orders')
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status, total, created_at, order_items(id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <p className="text-red-600">Failed to load orders. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-sm text-gray-500">View your order history and delivery status.</p>
        </div>
        <Link
          href="/account"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Account
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-10 text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/search"
            className="inline-block px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = Array.isArray(order.order_items) ? order.order_items.length : 0
            const badgeClass =
              STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-gray-500">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Placed on{' '}
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      · {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${badgeClass}`}
                    >
                      {order.status}
                    </span>
                    <span className="font-semibold text-base">
                      ${(order.total / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
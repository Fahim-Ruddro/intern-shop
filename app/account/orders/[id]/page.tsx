import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
  address?: string
  city?: string
  area?: string
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/account/orders/${id}`)
  }

  // Filter explicitly by user_id AND protected by RLS
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      status,
      subtotal,
      delivery_charge,
      total,
      shipping_address,
      created_at,
      order_items (
        id,
        product_id,
        name,
        quantity,
        unit_price
      )
    `
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !order) {
    notFound()
  }

  const shipping = (order.shipping_address || {}) as ShippingAddress
  const badgeClass = STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to My Orders
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on{' '}
            {new Date(order.created_at).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${badgeClass}`}
        >
          {order.status}
        </span>
      </div>

      {/* Items Snapshot */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-800">
        {order.order_items.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{item.name || 'Product'}</p>
              <p className="text-sm text-gray-500">
                ${(item.unit_price / 100).toFixed(2)} × {item.quantity}
              </p>
            </div>
            <p className="font-semibold">
              ${((item.unit_price * item.quantity) / 100).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Shipping & Totals */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-1.5">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500">
            Shipping Address
          </h2>
          <p className="font-medium">{shipping.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{shipping.phone}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{shipping.address}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {shipping.area}, {shipping.city}
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-2 text-sm">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500">
            Order Summary
          </h2>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span>${(order.subtotal / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Delivery</span>
            <span>${(order.delivery_charge / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 dark:border-gray-800">
            <span>Total</span>
            <span>${(order.total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
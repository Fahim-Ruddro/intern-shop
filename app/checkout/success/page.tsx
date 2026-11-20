import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import ClearCartOnSuccess from '@/components/ClearCartOnSuccess'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  if (!session_id) {
    redirect('/cart')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let isPaid = false
  let amountTotal = 0

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (
      session.payment_status === 'paid' &&
      session.metadata?.user_id === user.id
    ) {
      isPaid = true
      amountTotal = session.amount_total ?? 0
    }
  } catch (err) {
    console.error('Error verifying Stripe session:', err)
  }

  // Look up the order created by the Stripe webhook (RLS restricts to user_id = auth.uid())
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('stripe_session_id', session_id)
    .maybeSingle()

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center space-y-5">
      {isPaid ? (
        <>
          <ClearCartOnSuccess />
          <div className="w-14 h-14 mx-auto rounded-full bg-green-100 dark:bg-green-950 text-green-600 flex items-center justify-center text-2xl font-bold">
            ✓
          </div>
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for your order. Your payment of{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              ${(amountTotal / 100).toFixed(2)}
            </span>{' '}
            has been confirmed.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Payment Verification Pending</h1>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn&apos;t confirm payment status for this session yet.
          </p>
        </>
      )}

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={order ? `/account/orders/${order.id}` : '/account/orders'}
          className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          View Order Details
        </Link>
        <Link
          href="/search"
          className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
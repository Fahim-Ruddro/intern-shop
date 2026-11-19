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

      if (session.metadata?.order_id) {
        await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', session.metadata.order_id)
          .eq('user_id', user.id)
      }

      // Clear persisted DB cart once payment succeeds
      await supabase.from('cart_items').delete().eq('user_id', user.id)
    }
  } catch (err) {
    console.error('Error verifying Stripe session:', err)
  }

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

      <div className="pt-2">
        <Link
          href="/search"
          className="inline-block px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
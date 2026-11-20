import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing Stripe signature or webhook secret.' },
      { status: 400 }
    )
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    console.error('Stripe webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.user_id
      const addressId = session.metadata?.address_id
      const deliveryCharge = Number(session.metadata?.delivery_charge ?? 0)

      if (!userId || !addressId) {
        console.error('Missing metadata on checkout.session.completed:', session.id)
        return NextResponse.json(
          { error: 'Missing user_id or address_id in session metadata.' },
          { status: 400 }
        )
      }

      const supabaseAdmin = createAdminClient()

      const { data: orderId, error: rpcError } = await supabaseAdmin.rpc(
        'handle_stripe_checkout_completed',
        {
          p_user_id: userId,
          p_address_id: addressId,
          p_stripe_session_id: session.id,
          p_delivery_charge: deliveryCharge,
        }
      )

      if (rpcError) {
        console.error('RPC handle_stripe_checkout_completed failed:', rpcError)
        return NextResponse.json(
          { error: 'Failed to process order in database.' },
          { status: 500 }
        )
      }

      console.log(`Processed order ${orderId} for Stripe session ${session.id}`)
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
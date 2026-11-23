import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmationEmail } from '@/lib/email'

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

      // Check if order was already processed (idempotency guard for email sending)
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle()

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

      // Send confirmation email only when the order is newly created
      if (!existingOrder && orderId) {
        try {
          const [{ data: authData }, { data: orderRecord }] = await Promise.all([
            supabaseAdmin.auth.admin.getUserById(userId),
            supabaseAdmin
              .from('orders')
              .select('id, subtotal, delivery_charge, total, order_items(quantity, price_at_purchase, products(name))')
              .eq('id', orderId)
              .single(),
          ])

          const customerEmail = authData?.user?.email || session.customer_details?.email

          if (customerEmail && orderRecord) {
            const items = (orderRecord.order_items ?? []).map((item) => {
              const product = Array.isArray(item.products)
                ? item.products[0]
                : item.products
              return {
                name: (product as { name?: string } | null)?.name ?? 'Product',
                quantity: item.quantity,
                priceCents: item.price_at_purchase,
              }
            })

            await sendOrderConfirmationEmail({
              to: customerEmail,
              orderId: orderRecord.id,
              items,
              subtotalCents: orderRecord.subtotal,
              deliveryCents: orderRecord.delivery_charge,
              totalCents: orderRecord.total,
            })
          }
        } catch (emailErr) {
          console.error('[Email] Non-blocking confirmation email error:', emailErr)
        }
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
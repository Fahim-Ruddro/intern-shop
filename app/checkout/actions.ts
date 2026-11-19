'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import {
  addressSchema,
  FIXED_DELIVERY_CHARGE_CENTS,
} from '@/lib/validations/checkout'

export type CheckoutActionState = {
  error?: string
  fieldErrors?: {
    name?: string[]
    phone?: string[]
    address?: string[]
    city?: string[]
    area?: string[]
  }
}

export async function createCheckoutSession(
  _prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/checkout')
  }

  // 1. Validate shipping address with Zod
  const rawAddress = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    area: formData.get('area'),
  }

  const parsed = addressSchema.safeParse(rawAddress)
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  // 2. Fetch user's cart items & live product prices/stock directly from the database
  const { data: cartRows, error: cartError } = await supabase
    .from('cart_items')
    .select(
      `
      product_id,
      quantity,
      products (
        id,
        name,
        price,
        stock,
        image
      )
    `
    )
    .eq('user_id', user.id)

  if (cartError || !cartRows || cartRows.length === 0) {
    return { error: 'Your cart is empty.' }
  }

  const verifiedItems: {
    product_id: string
    name: string
    unit_price: number
    quantity: number
  }[] = []

  for (const row of cartRows) {
    const product = Array.isArray(row.products) ? row.products[0] : row.products
    if (!product) {
      return { error: 'One or more products in your cart no longer exist.' }
    }
    if (product.stock < row.quantity) {
      return {
        error: `Only ${product.stock} unit(s) of "${product.name}" remain in stock. Please update your cart.`,
      }
    }
    verifiedItems.push({
      product_id: product.id,
      name: product.name,
      unit_price: product.price,
      quantity: row.quantity,
    })
  }

  // 3. Calculate subtotal & total strictly on the server from DB prices
  const subtotal = verifiedItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  )
  const deliveryCharge = FIXED_DELIVERY_CHARGE_CENTS
  const total = subtotal + deliveryCharge

  // 4. Save address to `addresses` table (RLS enforces user_id = auth.uid())
  const { data: savedAddress, error: addressError } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      area: parsed.data.area,
    })
    .select('id')
    .single()

  if (addressError || !savedAddress) {
    return { error: 'Failed to save delivery address. Please try again.' }
  }

  // 5. Create pending order & order_items in database
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      address_id: savedAddress.id,
      status: 'pending',
      subtotal,
      delivery_charge: deliveryCharge,
      total,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { error: 'Could not initialize your order. Please try again.' }
  }

  const { error: orderItemsError } = await supabase.from('order_items').insert(
    verifiedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  )

  if (orderItemsError) {
    return { error: 'Failed to record order items. Please try again.' }
  }

  // 6. Determine origin URL for Stripe success & cancel redirects
  const headersList = await headers()
  const origin =
    headersList.get('origin') ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'

  // 7. Create Stripe Checkout Session in test mode
  let checkoutUrl: string | null = null
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
      line_items: [
        ...verifiedItems.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: item.unit_price,
          },
          quantity: item.quantity,
        })),
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Standard Delivery',
            },
            unit_amount: deliveryCharge,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel?order_id=${order.id}`,
    })

    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    checkoutUrl = session.url
  } catch (err) {
    console.error('Stripe Checkout error:', err)
    return {
      error: 'Unable to connect to Stripe Checkout. Check your Stripe configuration and try again.',
    }
  }

  if (!checkoutUrl) {
    return { error: 'Stripe did not return a checkout URL.' }
  }

  redirect(checkoutUrl)
}
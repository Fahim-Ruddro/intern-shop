import { Resend } from 'resend'

interface OrderEmailItem {
  name: string
  quantity: number
  priceCents: number
}

interface SendOrderConfirmationParams {
  to: string
  orderId: string
  items: OrderEmailItem[]
  subtotalCents: number
  deliveryCents: number
  totalCents: number
}

export async function sendOrderConfirmationEmail({
  to,
  orderId,
  items,
  subtotalCents,
  deliveryCents,
  totalCents,
}: SendOrderConfirmationParams) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not set; skipping confirmation email.')
    return { skipped: true }
  }

  const resend = new Resend(apiKey)
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Intern Shop <onboarding@resend.dev>'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://intern-shop.vercel.app'
  const shortOrderId = orderId.slice(0, 8).toUpperCase()

  const rowsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          ${item.name} &times; ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
          $${((item.priceCents * item.quantity) / 100).toFixed(2)}
        </td>
      </tr>`
    )
    .join('')

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111827;">
      <h1 style="font-size: 22px; margin-bottom: 8px;">Thanks for your order!</h1>
      <p style="color: #4b5563; margin-top: 0;">
        Order <strong>#${shortOrderId}</strong> has been confirmed and is being prepared.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 8px; border-bottom: 2px solid #111827;">Item</th>
            <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px solid #111827;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="font-size: 14px; text-align: right; space-y: 4px;">
        <p style="margin: 4px 0; color: #4b5563;">Subtotal: $${(subtotalCents / 100).toFixed(2)}</p>
        <p style="margin: 4px 0; color: #4b5563;">Delivery: $${(deliveryCents / 100).toFixed(2)}</p>
        <p style="margin: 8px 0 0; font-size: 16px; font-weight: 700;">Total Paid: $${(totalCents / 100).toFixed(2)}</p>
      </div>

      <div style="margin-top: 28px; text-align: center;">
        <a href="${siteUrl}/account/orders/${orderId}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          View Order Details
        </a>
      </div>
    </div>
  `

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Order Confirmed (#${shortOrderId}) — Intern Shop`,
    html,
  })

  if (error) {
    console.error('[Email] Failed to send order confirmation:', error)
    return { error }
  }

  return { id: data?.id }
}
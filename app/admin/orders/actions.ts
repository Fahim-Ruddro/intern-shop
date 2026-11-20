'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { assertAdminAction } from '@/lib/auth/admin'

const orderStatusSchema = z.enum([
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
])

export type OrderStatus = z.infer<typeof orderStatusSchema>

export type OrderActionState = {
  error?: string
  message?: string
}

export async function updateOrderStatus(
  orderId: string,
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const { supabase } = await assertAdminAction()

  const parsed = orderStatusSchema.safeParse(formData.get('status'))
  if (!parsed.success) {
    return { error: 'Invalid order status selected.' }
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: parsed.data })
    .eq('id', orderId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/account/orders')
  revalidatePath(`/account/orders/${orderId}`)

  return { message: `Order status updated to "${parsed.data}".` }
}
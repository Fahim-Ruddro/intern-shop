import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDbCart } from '@/app/cart/actions'
import CheckoutForm from '@/components/CheckoutForm'

export default async function CheckoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/checkout')
  }

  const items = await getDbCart()

  if (items.length === 0) {
    redirect('/cart')
  }

  // Load most recent address (or fall back to profile name/phone)
  const [{ data: latestAddress }, { data: profile }] = await Promise.all([
    supabase
      .from('addresses')
      .select('id, name, phone, address, city, area')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  const defaultAddress = latestAddress ?? {
    name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <CheckoutForm items={items} defaultAddress={defaultAddress} />
    </div>
  )
}
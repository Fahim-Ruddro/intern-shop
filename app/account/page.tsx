import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccountForm from '@/components/AccountForm'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <AccountForm
        email={user.email ?? ''}
        fullName={profile?.full_name ?? user.user_metadata?.full_name ?? ''}
        phone={profile?.phone ?? ''}
        role={profile?.role ?? 'customer'}
      />
    </div>
  )
}
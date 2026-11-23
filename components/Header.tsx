import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SearchInput from './SearchInput'
import CartBadge from './CartBadge'
import AccountMenu from './AccountMenu'

export default async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let displayName = user?.email ?? ''

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    displayName = profile?.full_name?.trim() || user.email || 'Account'
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 md:gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="text-lg sm:text-xl font-bold tracking-tight shrink-0 order-1"
        >
          Intern Shop
        </Link>

        {/* Right Nav Actions */}
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-2 sm:gap-3 shrink-0 order-2 md:order-3"
        >
          <Link
            href="/search"
            className="text-sm font-medium px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            Shop
          </Link>
          <CartBadge />
          {user ? (
            <AccountMenu
              displayName={displayName}
              email={user.email ?? ''}
            />
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium bg-black dark:bg-white text-white dark:text-black px-3.5 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign in
            </Link>
          )}
        </nav>

        {/* Search Input (Full width row on mobile, centered inline on md+) */}
        <div className="w-full md:flex-1 md:max-w-md order-3 md:order-2">
          <SearchInput />
        </div>
      </div>
    </header>
  )
}
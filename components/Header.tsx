import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import SearchInput from './SearchInput'
import AccountMenu from './AccountMenu'

export default async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="font-bold text-xl tracking-tight shrink-0">
          Intern Shop
        </Link>

        {/* Debounced Search Box */}
        <Suspense fallback={<div className="w-full max-w-md h-9 bg-gray-100 dark:bg-gray-900 rounded-lg" />}>
          <SearchInput />
        </Suspense>

        {/* Navigation & Auth Actions */}
        <nav className="flex items-center gap-4 shrink-0 text-sm">
          <Link href="/search" className="hidden sm:inline hover:text-blue-600 transition-colors">
            Shop
          </Link>

          {user ? (
            <AccountMenu
              displayName={user.user_metadata?.full_name || user.email || 'Account'}
              email={user.email || ''}
            />
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
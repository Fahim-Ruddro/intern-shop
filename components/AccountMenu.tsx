'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'

export default function AccountMenu({
  displayName,
  email,
}: {
  displayName: string
  email: string
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
      >
        <span className="truncate max-w-32">{displayName}</span>
        <span className="text-xs text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-900">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            Account Settings
          </Link>

          <Link
            href="/account/orders"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            My Orders
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              Log Out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
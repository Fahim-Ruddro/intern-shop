import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin('/admin')

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-black text-white dark:bg-white dark:text-black">
            Admin
          </span>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/products" className="hover:text-blue-600 transition-colors">
              Products
            </Link>
            <Link href="/admin/orders" className="hover:text-blue-600 transition-colors">
              Orders
            </Link>
          </nav>
        </div>

        <Link href="/" className="text-xs text-gray-500 hover:underline">
          ← Back to Storefront
        </Link>
      </div>

      {children}
    </div>
  )
}
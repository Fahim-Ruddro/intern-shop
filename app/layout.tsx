import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { CartProvider } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Intern Shop',
  description: 'Modern e-commerce store built with Next.js and Supabase',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black focus:font-medium"
        >
          Skip to main content
        </a>
        <CartProvider initialUserId={user?.id ?? null}>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  )
}
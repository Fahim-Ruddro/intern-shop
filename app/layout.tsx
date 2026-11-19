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
        <CartProvider initialUserId={user?.id ?? null}>
          <Header />
          <main className="flex-1">{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
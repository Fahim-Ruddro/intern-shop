import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WishlistButton from '@/components/WishlistButton'

export const metadata = {
  title: 'My Wishlist — Intern Shop',
}

export default async function WishlistPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account/wishlist')
  }

  const { data: wishlistRows } = await supabase
    .from('wishlists')
    .select('id, created_at, products(id, name, slug, price, stock, image, categories(name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  const items = (wishlistRows ?? [])
    .map((row) => {
      const prod = Array.isArray(row.products) ? row.products[0] : row.products
      return prod ? { wishlistId: row.id, product: prod } : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Wishlist</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {items.length} saved {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Link
          href="/search"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Continue shopping →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Your wishlist is empty. Save products you love while browsing!
          </p>
          <Link
            href="/search"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg text-sm font-semibold"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ wishlistId, product }) => {
            const cat = Array.isArray(product.categories)
              ? product.categories[0]
              : product.categories
            const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${product.image}`

            return (
              <div
                key={wishlistId}
                className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <Link href={`/products/${product.slug}`} className="group block">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                    {product.image && (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    {cat?.name && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                        {cat.name}
                      </p>
                    )}
                    <h2 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {product.name}
                    </h2>
                    <p className="text-sm font-medium">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                  </div>
                </Link>
                <div className="px-4 pb-4 flex items-center gap-2">
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex-1 text-center bg-black dark:bg-white text-white dark:text-black py-2.5 px-3 rounded-lg text-sm font-semibold hover:opacity-90"
                  >
                    View Product
                  </Link>
                  <WishlistButton
                    productId={product.id}
                    initialWishlisted={true}
                    revalidateTarget="/account/wishlist"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
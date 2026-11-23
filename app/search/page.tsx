import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCategories, searchProducts, SearchParamsInput } from '@/lib/data/products'
import SearchFilters from '@/components/SearchFilters'
import WishlistButton from '@/components/WishlistButton'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>
}) {
  const resolvedParams = await searchParams
  const supabase = await createClient()

  const [
    categories,
    { products, totalCount, totalPages, currentPage },
    {
      data: { user },
    },
  ] = await Promise.all([
    getCategories(),
    searchProducts(resolvedParams),
    supabase.auth.getUser(),
  ])

  let wishlistedIds = new Set<string>()
  if (user) {
    const { data: wishlistRows } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id)
    wishlistedIds = new Set((wishlistRows ?? []).map((w) => w.product_id))
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (resolvedParams.q) params.set('q', resolvedParams.q)
    if (resolvedParams.category) params.set('category', resolvedParams.category)
    if (resolvedParams.minPrice) params.set('minPrice', resolvedParams.minPrice)
    if (resolvedParams.maxPrice) params.set('maxPrice', resolvedParams.maxPrice)
    if (resolvedParams.inStock) params.set('inStock', resolvedParams.inStock)
    if (resolvedParams.sort) params.set('sort', resolvedParams.sort)
    if (targetPage > 1) params.set('page', String(targetPage))

    const queryString = params.toString()
    return queryString ? `/search?${queryString}` : '/search'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {resolvedParams.q ? `Results for "${resolvedParams.q}"` : 'Browse Products'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Showing {products.length} of {totalCount} {totalCount === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 border border-gray-200 dark:border-gray-800 rounded-xl p-5 h-fit">
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-900 rounded-lg" />}>
            <SearchFilters categories={categories} />
          </Suspense>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl px-4">
              <h2 className="text-xl font-semibold mb-2">No matching products found</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                Try adjusting your search keywords, price range, or clearing active filters to see more items.
              </p>
              <Link
                href="/search"
                className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => {
                  const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${product.image}`
                  return (
                    <div key={product.id} className="group relative">
                      <div className="absolute top-3 right-3 z-10">
                        <WishlistButton
                          productId={product.id}
                          initialWishlisted={wishlistedIds.has(product.id)}
                          revalidateTarget="/search"
                          variant="icon"
                        />
                      </div>
                      <Link href={`/products/${product.slug}`} className="block">
                        <div className="bg-gray-100 dark:bg-gray-900 aspect-square rounded-lg mb-3 relative overflow-hidden">
                          {product.image && (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                          {product.category?.name}
                        </p>
                        <h2 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h2>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-gray-600 dark:text-gray-400">
                            ${(product.price / 100).toFixed(2)}
                          </p>
                          {product.stock <= 0 ? (
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                              Out of stock
                            </span>
                          ) : product.stock <= 5 ? (
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                              Only {product.stock} left
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={buildPageHref(currentPage - 1)}
                      className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                      Previous
                    </Link>
                  )}

                  <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>

                  {currentPage < totalPages && (
                    <Link
                      href={buildPageHref(currentPage + 1)}
                      className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
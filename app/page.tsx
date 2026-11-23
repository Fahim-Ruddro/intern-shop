import Image from 'next/image'
import Link from 'next/link'
import { getCategories, getFeaturedProducts, getNewArrivals } from '@/lib/data/products'

export default async function HomePage() {
  const [categories, featuredProducts, newArrivals] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getNewArrivals(),
  ])

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-12 md:space-y-16">
      {/* Hero Banner */}
      <section className="bg-gray-100 dark:bg-gray-900 rounded-2xl px-6 py-10 sm:p-12 md:p-16 text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Welcome to Intern Shop
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-base sm:text-lg">
          Everyday essentials, developer gear, and minimalist apparel built for comfort.
        </p>
        <div className="pt-2">
          <Link
            href="/search"
            className="inline-block w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Browse All Products
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
             className="flex items-center justify-center min-h-18 sm:min-h-20 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-4 text-center hover:border-black dark:hover:border-white transition-colors"
            >
              <h3 className="font-semibold text-sm sm:text-base">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Featured Products</h2>
          <Link
            href="/search"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => {
            const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${product.image}`
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                <div className="bg-gray-100 dark:bg-gray-900 aspect-square rounded-lg mb-3 relative overflow-hidden">
                  {product.image && (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      priority={index < 2}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                  {product.category?.name}
                </p>
                <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  ${(product.price / 100).toFixed(2)}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section>
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">New Arrivals</h2>
          <Link
            href="/search?sort=newest"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            See newest →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => {
            const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${product.image}`
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                <div className="bg-gray-100 dark:bg-gray-900 aspect-square rounded-lg mb-3 relative overflow-hidden">
                  {product.image && (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                  {product.category?.name}
                </p>
                <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  ${(product.price / 100).toFixed(2)}
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryWithProducts } from '@/lib/data/products'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getCategoryWithProducts(slug)

  if (!data) {
    return { title: 'Category Not Found | Intern Shop' }
  }

  return {
    title: `${data.category.name} | Intern Shop`,
    description: `Browse all ${data.category.name} products at Intern Shop.`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getCategoryWithProducts(slug)

  if (!data) {
    notFound()
  }

  const { category, products } = data
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/search" className="hover:text-black dark:hover:text-white transition-colors">
          Categories
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="text-gray-500 mt-1">
          {products.length} {products.length === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
          <p className="text-gray-500 mb-4">No products found in this category yet.</p>
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => {
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
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  )}
                </div>
                <h2 className="font-medium group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h2>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-gray-600 dark:text-gray-400">
                    ${(product.price / 100).toFixed(2)}
                  </p>
                  {product.stock <= 0 && (
                    <span className="text-xs text-red-600 font-medium">Out of stock</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
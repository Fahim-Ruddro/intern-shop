import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/lib/data/products'
import AddToCartButton from '@/components/AddToCartButton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const product = await getProductBySlug(resolvedParams.slug)

  if (!product) {
    return {
      title: 'Product Not Found | Intern Shop',
      description: 'The requested product could not be found at Intern Shop.',
    }
  }

  return {
    title: `${product.name} | Intern Shop`,
    description:
      product.description?.trim() ||
      `Shop ${product.name} in ${product.category?.name ?? 'our catalog'} at Intern Shop.`,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const product = await getProductBySlug(resolvedParams.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(
    product.category_id,
    product.id
  )

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${product.image}`

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Main Product Image Container */}
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center relative w-full aspect-square">
          {product.image ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <span className="text-gray-600 dark:text-gray-400">No image available</span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-2">
            {product.category?.name}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {product.name}
          </h1>
          <p className="text-2xl text-gray-900 dark:text-gray-100 font-medium mb-4">
            ${(product.price / 100).toFixed(2)}
          </p>

          <div className="mb-6">
            {product.stock <= 0 ? (
              <span className="text-red-700 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-full text-sm">
                Out of stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="text-orange-700 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-orange-950/60 px-3 py-1 rounded-full text-sm">
                Only {product.stock} left
              </span>
            ) : (
              <span className="text-green-700 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-950/60 px-3 py-1 rounded-full text-sm">
                In stock
              </span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>

          <AddToCartButton product={product} />
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section
          aria-labelledby="related-products-heading"
          className="mt-24 border-t border-gray-200 dark:border-gray-800 pt-12"
        >
          <h2 id="related-products-heading" className="text-2xl font-bold mb-8">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const relatedImageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${p.image}`

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group block"
                >
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg mb-4 overflow-hidden relative w-full aspect-square">
                    {p.image && (
                      <Image
                        src={relatedImageUrl}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    ${(p.price / 100).toFixed(2)}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/lib/data/products'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // Wait for the URL parameters to load
  const resolvedParams = await params
  
  // Fetch the product from our Supabase database
  const product = await getProductBySlug(resolvedParams.slug)
  
  // If the URL is wrong, show a 404 page
  if (!product) {
    notFound()
  }

  // Fetch up to 4 other products in the same category
  const relatedProducts = await getRelatedProducts(product.category_id, product.id)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Placeholder */}
        <div className="bg-gray-200 aspect-square rounded-xl flex items-center justify-center text-gray-500">
          [Image Placeholder: {product.image}]
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider mb-2">
            {product.category?.name}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-2xl text-gray-900 font-medium mb-6">
            ${(product.price / 100).toFixed(2)}
          </p>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>
          
          <button className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors w-full md:w-auto">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 border-t pt-12">
          <h2 className="text-2xl font-bold mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <a key={p.id} href={`/products/${p.slug}`} className="group block">
                <div className="bg-gray-100 aspect-square rounded-lg mb-4 flex items-center justify-center text-sm text-gray-400">
                  {p.image}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {p.name}
                </h3>
                <p className="text-gray-600">${(p.price / 100).toFixed(2)}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
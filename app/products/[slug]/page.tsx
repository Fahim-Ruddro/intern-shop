import Image from 'next/image'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/lib/data/products'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params
  const product = await getProductBySlug(resolvedParams.slug)
  
  if (!product) {
    return { title: 'Product Not Found | Intern Shop' }
  }

  return {
    title: `${product.name} | Intern Shop`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const product = await getProductBySlug(resolvedParams.slug)
  
  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category_id, product.id)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${product.image}`

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Main Product Image Container */}
        <div 
          className="bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center"
          style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}
        >
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
            <span className="text-gray-400">No image available</span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider mb-2">
            {product.category?.name}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-2xl text-gray-900 font-medium mb-4">
            ${(product.price / 100).toFixed(2)}
          </p>
          
          <div className="mb-6">
            {product.stock <= 0 ? (
              <span className="text-red-600 font-semibold bg-red-50 px-3 py-1 rounded-full text-sm">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-orange-600 font-semibold bg-orange-50 px-3 py-1 rounded-full text-sm">Only {product.stock} left</span>
            ) : (
              <span className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full text-sm">In stock</span>
            )}
          </div>

          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>
          
          <button 
            disabled={product.stock <= 0}
            className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors w-full md:w-auto disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 border-t pt-12">
          <h2 className="text-2xl font-bold mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const relatedImageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${p.image}`
              
              return (
                <a key={p.id} href={`/products/${p.slug}`} className="group block">
                  {/* Related Image Container */}
                  <div 
                    className="bg-gray-100 rounded-lg mb-4 overflow-hidden group"
                    style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}
                  >
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
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-gray-600">${(p.price / 100).toFixed(2)}</p>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
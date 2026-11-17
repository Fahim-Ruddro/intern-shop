import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
      <p className="text-gray-600 mb-8">We couldn&apos;t find the product you&apos;re looking for.</p>
      <Link 
        href="/" 
        className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
      >
        Return to Shop
      </Link>
    </div>
  )
}
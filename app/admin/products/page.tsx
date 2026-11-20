import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/admin'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

const PAGE_SIZE = 10

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { supabase } = await requireAdmin('/admin/products')
  const { q = '', page = '1' } = await searchParams

  const queryText = q.trim()
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let dbQuery = supabase
    .from('products')
    .select('id, name, slug, price, stock, image, categories(name)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (queryText) {
    dbQuery = dbQuery.or(`name.ilike.%${queryText}%,slug.ilike.%${queryText}%`)
  }

  const { data: products, count } = await dbQuery
  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">
            {totalCount} {totalCount === 1 ? 'product' : 'products'} total
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold hover:opacity-90"
        >
          + New Product
        </Link>
      </div>

      {/* Search Bar */}
      <form method="GET" action="/admin/products" className="flex gap-2 max-w-md">
        <input
          type="text"
          name="q"
          defaultValue={queryText}
          placeholder="Search by product name or slug..."
          className="flex-1 px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          Search
        </button>
        {queryText && (
          <Link
            href="/admin/products"
            className="px-3 py-2 text-sm text-gray-500 hover:underline self-center"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Products Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto">
        {!products || products.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">
            No products found.
          </p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {products.map((product) => {
                const categoryName =
                  product.categories && !Array.isArray(product.categories)
                    ? product.categories.name
                    : '—'

                return (
                  <tr key={product.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover border border-gray-200 dark:border-gray-800"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs font-mono text-gray-500">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {categoryName}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      ${(product.price / 100).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : product.stock <= 5
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/admin/products?${new URLSearchParams({
                  ...(queryText ? { q: queryText } : {}),
                  page: String(currentPage - 1),
                }).toString()}`}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                ← Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/admin/products?${new URLSearchParams({
                  ...(queryText ? { q: queryText } : {}),
                  page: String(currentPage + 1),
                }).toString()}`}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
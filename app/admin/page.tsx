import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/admin'

const LOW_STOCK_THRESHOLD = 5

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin('/admin')

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [
    { count: ordersTodayCount },
    { data: paidOrders },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfToday.toISOString()),
    supabase
      .from('orders')
      .select('total, status')
      .in('status', ['paid', 'shipped', 'delivered']),
    supabase
      .from('products')
      .select('id, name, slug, stock, price')
      .lte('stock', LOW_STOCK_THRESHOLD)
      .order('stock', { ascending: true }),
  ])

  const totalSalesCents = (paidOrders ?? []).reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Store Overview</h1>
        <p className="text-sm text-gray-500">Live metrics across orders and inventory.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Orders Today
          </p>
          <p className="text-3xl font-bold">{ordersTodayCount ?? 0}</p>
          <Link href="/admin/orders" className="inline-block text-xs text-blue-600 hover:underline pt-1">
            Manage orders →
          </Link>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total Test Sales
          </p>
          <p className="text-3xl font-bold">${(totalSalesCents / 100).toFixed(2)}</p>
          <p className="text-xs text-gray-500 pt-1">
            Across {paidOrders?.length ?? 0} paid/fulfilled orders
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Low-Stock Products (≤ {LOW_STOCK_THRESHOLD})
          </p>
          <p className="text-3xl font-bold">{lowStockProducts?.length ?? 0}</p>
          <Link href="/admin/products" className="inline-block text-xs text-blue-600 hover:underline pt-1">
            Manage inventory →
          </Link>
        </div>
      </div>

      {/* Low-Stock Alert Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold">Low-Stock Products</h2>
          <Link href="/admin/products/new" className="text-xs font-medium text-blue-600 hover:underline">
            + Add Product
          </Link>
        </div>

        {!lowStockProducts || lowStockProducts.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">All products are well stocked.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {lowStockProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-3 font-medium">{product.name}</td>
                  <td className="px-5 py-3">${(product.price / 100).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                      }`}
                    >
                      {product.stock} left
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Restock
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
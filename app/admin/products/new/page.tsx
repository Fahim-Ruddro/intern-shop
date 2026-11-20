import { requireAdmin } from '@/lib/auth/admin'
import ProductForm from '@/components/admin/ProductForm'
import { createProduct } from '@/app/admin/products/actions'

export default async function NewProductPage() {
  const { supabase } = await requireAdmin('/admin/products/new')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Product</h1>
        <p className="text-sm text-gray-500">Create a new product in your catalog.</p>
      </div>

      <ProductForm categories={categories ?? []} action={createProduct} />
    </div>
  )
}
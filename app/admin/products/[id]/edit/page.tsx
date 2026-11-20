import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/admin'
import ProductForm from '@/components/admin/ProductForm'
import { updateProduct } from '@/app/admin/products/actions'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase } = await requireAdmin(`/admin/products/${id}/edit`)

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, slug, category_id, description, price, stock, image')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true }),
  ])

  if (!product) {
    notFound()
  }

  const updateProductWithId = updateProduct.bind(null, product.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-gray-500">Update details, stock, or product image.</p>
      </div>

      <ProductForm
        categories={categories ?? []}
        product={product}
        action={updateProductWithId}
      />
    </div>
  )
}
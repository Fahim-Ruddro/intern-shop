import { supabase } from '../supabase'

// Fetch a single product by its slug (for the product detail page)
export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }
  return data
}

// Fetch related products from the same category (excluding the current product)
export async function getRelatedProducts(categoryId: string, excludeProductId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .neq('id', excludeProductId)
    .limit(4)

  if (error) {
    console.error('Error fetching related products:', error)
    return []
  }
  return data
}
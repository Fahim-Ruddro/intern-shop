import { supabase } from '@/lib/supabase'

export async function getProductBySlug(slug: string) {
  if (!slug) return null

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching product:', error.message)
    return null
  }
  return data
}

export async function getRelatedProducts(categoryId: string | null, currentProductId: string) {
  if (!categoryId) return []

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .neq('id', currentProductId)
    .limit(4)

  if (error) {
    console.error('Error fetching related products:', error.message)
    return []
  }
  return data || []
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error.message)
    return []
  }
  return data || []
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .gt('stock', 0)
    .limit(4)

  if (error) {
    console.error('Error fetching featured products:', error.message)
    return []
  }
  return data || []
}

export async function getNewArrivals() {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Error fetching new arrivals:', error.message)
    return []
  }
  return data || []
}

export async function getCategoryWithProducts(slug: string) {
  if (!slug) return null

  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (catError || !category) {
    return null
  }

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  if (prodError) {
    console.error('Error fetching category products:', prodError.message)
    return { category, products: [] }
  }

  return { category, products: products || [] }
}

export interface SearchParamsInput {
  q?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  sort?: string
  page?: string
}

export async function searchProducts(params: SearchParamsInput) {
  const pageSize = 8
  const page = Math.max(1, Number(params.page) || 1)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let matchingIds: string[] | null = null

  if (params.q && params.q.trim()) {
    const { data: idRows, error: rpcError } = await supabase.rpc('search_product_ids', {
      search_term: params.q.trim(),
    })

    if (rpcError) {
      console.error('Error in search RPC:', rpcError.message)
      return { products: [], totalCount: 0, totalPages: 0, currentPage: page }
    }

    matchingIds = (idRows || []) as string[]
    if (matchingIds.length === 0) {
      return { products: [], totalCount: 0, totalPages: 0, currentPage: page }
    }
  }

  let query = supabase
    .from('products')
    .select('*, category:categories!inner(*)', { count: 'exact' })

  if (matchingIds !== null) {
    query = query.in('id', matchingIds)
  }

  if (params.category) {
    query = query.eq('category.slug', params.category)
  }

  if (params.minPrice && !isNaN(Number(params.minPrice))) {
    query = query.gte('price', Math.round(Number(params.minPrice) * 100))
  }
  if (params.maxPrice && !isNaN(Number(params.maxPrice))) {
    query = query.lte('price', Math.round(Number(params.maxPrice) * 100))
  }

  if (params.inStock === 'true') {
    query = query.gt('stock', 0)
  }

  switch (params.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error searching products:', error.message)
    return { products: [], totalCount: 0, totalPages: 0, currentPage: page }
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    products: data || [],
    totalCount,
    totalPages,
    currentPage: page,
  }
}
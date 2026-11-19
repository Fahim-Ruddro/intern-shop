'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type CartItem = {
  product_id: string
  name: string
  slug: string
  price: number
  image: string | null
  stock: number
  quantity: number
}

export async function getDbCart(): Promise<CartItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('cart_items')
    .select(
      `
      product_id,
      quantity,
      products (
        id,
        name,
        slug,
        price,
        image,
        stock
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  const items: CartItem[] = []
  for (const row of data) {
    const product = Array.isArray(row.products) ? row.products[0] : row.products
    if (!product) continue
    if (product.stock <= 0) continue

    const clampedQty = Math.min(row.quantity, product.stock)
    items.push({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity: clampedQty,
    })
  }

  return items
}

export async function mergeGuestCartIntoDb(
  guestItems: { product_id: string; quantity: number }[]
): Promise<CartItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  if (guestItems.length > 0) {
    const productIds = guestItems.map((i) => i.product_id)

    const [{ data: products }, { data: existingRows }] = await Promise.all([
      supabase.from('products').select('id, stock').in('id', productIds),
      supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('user_id', user.id)
        .in('product_id', productIds),
    ])

    const stockMap = new Map((products ?? []).map((p) => [p.id, p.stock]))
    const existingMap = new Map(
      (existingRows ?? []).map((r) => [r.product_id, r.quantity])
    )

    const upserts: {
      user_id: string
      product_id: string
      quantity: number
      updated_at: string
    }[] = []

    for (const item of guestItems) {
      const maxStock = stockMap.get(item.product_id) ?? 0
      if (maxStock <= 0) continue

      const existingQty = existingMap.get(item.product_id) ?? 0
      const mergedQty = Math.min(existingQty + item.quantity, maxStock)

      if (mergedQty > 0) {
        upserts.push({
          user_id: user.id,
          product_id: item.product_id,
          quantity: mergedQty,
          updated_at: new Date().toISOString(),
        })
      }
    }

    if (upserts.length > 0) {
      await supabase
        .from('cart_items')
        .upsert(upserts, { onConflict: 'user_id,product_id' })
    }
  }

  revalidatePath('/cart')
  return getDbCart()
}

export async function syncCartItemToDb(
  productId: string,
  quantity: number
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  if (quantity <= 0) {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)
    return
  }

  const { data: product } = await supabase
    .from('products')
    .select('stock')
    .eq('id', productId)
    .single()

  if (!product || product.stock <= 0) {
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)
    return
  }

  const clampedQty = Math.min(quantity, product.stock)

  await supabase.from('cart_items').upsert(
    {
      user_id: user.id,
      product_id: productId,
      quantity: clampedQty,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,product_id' }
  )
}

export async function clearDbCart(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from('cart_items').delete().eq('user_id', user.id)
  revalidatePath('/cart')
}
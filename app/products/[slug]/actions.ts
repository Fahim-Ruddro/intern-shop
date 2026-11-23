'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const reviewSchema = z.object({
  productId: z.string().uuid(),
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(3, 'Review must be at least 3 characters.').max(1000),
})

export async function submitProductReview(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Please sign in to leave a review.' }
  }

  const parsed = reviewSchema.safeParse({
    productId: formData.get('productId'),
    slug: formData.get('slug'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid review input.' }
  }

  const { productId, slug, rating, comment } = parsed.data

  // Verify the user actually purchased this product
  const { data: purchase } = await supabase
    .from('orders')
    .select('id, order_items!inner(product_id)')
    .eq('user_id', user.id)
    .eq('order_items.product_id', productId)
    .neq('status', 'cancelled')
    .limit(1)
    .maybeSingle()

  if (!purchase) {
    return { error: 'Only verified buyers of this product can leave a review.' }
  }

  const { error } = await supabase.from('product_reviews').upsert(
    {
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'product_id,user_id' }
  )

  if (error) {
    console.error('Review upsert failed:', error)
    return { error: 'Could not save review. Please try again.' }
  }

  revalidatePath(`/products/${slug}`)
  return { success: true }
}

export async function deleteProductReview(reviewId: string, slug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('product_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to delete review.' }

  revalidatePath(`/products/${slug}`)
  return { success: true }
}

export async function toggleWishlistItem(productId: string, revalidateTarget = '/account/wishlist') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Please sign in to save items to your wishlist.', requiresAuth: true }
  }

  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id)
    revalidatePath(revalidateTarget)
    revalidatePath('/account/wishlist')
    return { wishlisted: false }
  }

  const { error } = await supabase.from('wishlists').insert({
    user_id: user.id,
    product_id: productId,
  })

  if (error) {
    return { error: 'Failed to update wishlist.' }
  }

  revalidatePath(revalidateTarget)
  revalidatePath('/account/wishlist')
  return { wishlisted: true }
}
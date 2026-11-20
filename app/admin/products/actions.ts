'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { assertAdminAction } from '@/lib/auth/admin'
import {
  productSchema,
  validateImageFile,
  type ProductActionState,
} from '@/lib/validations/product'

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
}

export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const { supabase } = await assertAdminAction()

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    category_id: formData.get('category_id'),
    description: formData.get('description') ?? '',
    price_dollars: formData.get('price_dollars'),
    stock: formData.get('stock'),
  })

  const imageEntry = formData.get('image')
  const imageFile = imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null
  const imageError = validateImageFile(imageFile)

  if (!parsed.success || imageError) {
    const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors
    return {
      fieldErrors: {
        ...fieldErrors,
        ...(imageError ? { image: [imageError] } : {}),
      },
    }
  }

  let imageUrl: string | null = null

  if (imageFile) {
    const filePath = `${Date.now()}-${sanitizeFileName(imageFile.name)}`
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (uploadError) {
      return { error: `Image upload failed: ${uploadError.message}` }
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    imageUrl = publicUrlData.publicUrl
  }

  const priceCents = Math.round(parsed.data.price_dollars * 100)

  const { error } = await supabase.from('products').insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    category_id: parsed.data.category_id,
    description: parsed.data.description || null,
    price: priceCents,
    stock: parsed.data.stock,
    image: imageUrl,
  })

  if (error) {
    if (error.code === '23505') {
      return {
        fieldErrors: { slug: ['A product with this slug already exists.'] },
      }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/search')
  redirect('/admin/products')
}

export async function updateProduct(
  productId: string,
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const { supabase } = await assertAdminAction()

  const parsed = productSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    category_id: formData.get('category_id'),
    description: formData.get('description') ?? '',
    price_dollars: formData.get('price_dollars'),
    stock: formData.get('stock'),
  })

  const imageEntry = formData.get('image')
  const imageFile = imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null
  const imageError = validateImageFile(imageFile)

  if (!parsed.success || imageError) {
    const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors
    return {
      fieldErrors: {
        ...fieldErrors,
        ...(imageError ? { image: [imageError] } : {}),
      },
    }
  }

  const existingImage = (formData.get('existing_image') as string) || null
  let imageUrl: string | null = existingImage

  if (imageFile) {
    const filePath = `${Date.now()}-${sanitizeFileName(imageFile.name)}`
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (uploadError) {
      return { error: `Image upload failed: ${uploadError.message}` }
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    imageUrl = publicUrlData.publicUrl
  }

  const priceCents = Math.round(parsed.data.price_dollars * 100)

  const { error } = await supabase
    .from('products')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      category_id: parsed.data.category_id,
      description: parsed.data.description || null,
      price: priceCents,
      stock: parsed.data.stock,
      image: imageUrl,
    })
    .eq('id', productId)

  if (error) {
    if (error.code === '23505') {
      return {
        fieldErrors: { slug: ['A product with this slug already exists.'] },
      }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath(`/products/${parsed.data.slug}`)
  redirect('/admin/products')
}

export async function deleteProduct(productId: string) {
  const { supabase } = await assertAdminAction()

  const { error } = await supabase.from('products').delete().eq('id', productId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/search')
}
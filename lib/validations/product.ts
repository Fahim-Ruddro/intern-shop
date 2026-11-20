import { z } from 'zod'

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Product name must be at least 2 characters.')
    .max(120, 'Product name must be 120 characters or fewer.'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters.')
    .max(140, 'Slug must be 140 characters or fewer.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must use lowercase letters, numbers, and hyphens only (e.g. classic-cotton-tee).'
    ),
  category_id: z.string().uuid('Please select a valid category.'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must be 2000 characters or fewer.')
    .optional()
    .default(''),
  price_dollars: z.coerce
    .number({ message: 'Enter a valid price.' })
    .min(0.5, 'Price must be at least $0.50.')
    .max(100000, 'Price is too high.'),
  stock: z.coerce
    .number({ message: 'Enter a valid stock count.' })
    .int('Stock must be a whole number.')
    .min(0, 'Stock cannot be negative.')
    .max(1000000, 'Stock is too high.'),
})

export type ProductActionState = {
  error?: string
  fieldErrors?: {
    name?: string[]
    slug?: string[]
    category_id?: string[]
    description?: string[]
    price_dollars?: string[]
    stock?: string[]
    image?: string[]
  }
}

export function validateImageFile(file: File | null): string | null {
  if (!file || file.size === 0) return null

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return 'Invalid file type. Allowed formats: JPG, PNG, WebP, or AVIF.'
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image exceeds the 2 MB size limit.'
  }

  return null
}

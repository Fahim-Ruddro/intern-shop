'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  type ProductActionState,
} from '@/lib/validations/product'

type Category = {
  id: string
  name: string
}

type InitialProduct = {
  id: string
  name: string
  slug: string
  category_id: string | null
  description: string | null
  price: number
  stock: number
  image: string | null
}

const initialState: ProductActionState = {}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ProductForm({
  categories,
  product,
  action,
}: {
  categories: Category[]
  product?: InitialProduct
  action: (
    prevState: ProductActionState,
    formData: FormData
  ) => Promise<ProductActionState>
}) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(Boolean(product))
  const [clientImageError, setClientImageError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.image ?? null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slugTouched) {
      setSlug(slugify(e.target.value))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientImageError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
      )
    ) {
      setClientImageError('Invalid file type. Use JPG, PNG, WebP, or AVIF.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setClientImageError('File is too large. Maximum allowed size is 2 MB.')
      e.target.value = ''
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
  }

  return (
    <form action={formAction} noValidate className="space-y-5 max-w-2xl">
      {product?.image && (
        <input type="hidden" name="existing_image" value={product.image} />
      )}

      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Product Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={product?.name ?? ''}
            onChange={handleNameChange}
            placeholder="Classic Cotton Tee"
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            placeholder="classic-cotton-tee"
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm font-mono"
          />
          {state.fieldErrors?.slug && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.slug[0]}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={product?.category_id ?? categories[0]?.id ?? ''}
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.category_id && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.category_id[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="price_dollars" className="block text-sm font-medium mb-1">
            Price (USD)
          </label>
          <input
            id="price_dollars"
            name="price_dollars"
            type="number"
            step="0.01"
            min="0.50"
            defaultValue={product ? (product.price / 100).toFixed(2) : ''}
            placeholder="29.99"
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
          />
          {state.fieldErrors?.price_dollars && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.price_dollars[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium mb-1">
            Stock Quantity
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 10}
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
          />
          {state.fieldErrors?.stock && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.stock[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ''}
          placeholder="Material, fit, care instructions..."
          className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
        />
        {state.fieldErrors?.description && (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.description[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="image" className="block text-sm font-medium">
          Product Image (JPG, PNG, WebP, AVIF · Max 2 MB)
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 dark:file:bg-gray-900 file:text-gray-900 dark:file:text-gray-100 hover:file:opacity-90"
        />
        {(clientImageError || state.fieldErrors?.image) && (
          <p className="text-xs text-red-600">
            {clientImageError || state.fieldErrors?.image?.[0]}
          </p>
        )}
        {previewUrl && (
          <div className="pt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="h-28 w-28 object-cover rounded-lg border border-gray-200 dark:border-gray-800"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending || Boolean(clientImageError)}
          className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {isPending
            ? 'Saving...'
            : product
              ? 'Update Product'
              : 'Create Product'}
        </button>
        <Link
          href="/admin/products"
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

function PriceRangeInputs({
  initialMin,
  initialMax,
  onApply,
}: {
  initialMin: string
  initialMax: string
  onApply: (min: string, max: string) => void
}) {
  const [min, setMin] = useState(initialMin)
  const [max, setMax] = useState(initialMax)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onApply(min, max)
      }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Min $"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Max $"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
        />
      </div>
      <button
        type="submit"
        className="w-full py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
      >
        Apply Price
      </button>
    </form>
  )
}

export default function SearchFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') || ''
  const activeMinPrice = searchParams.get('minPrice') || ''
  const activeMaxPrice = searchParams.get('maxPrice') || ''
  const activeInStock = searchParams.get('inStock') === 'true'
  const activeSort = searchParams.get('sort') || 'newest'

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 whenever filters or sort order change
    params.delete('page')

    const queryString = params.toString()
    router.push(queryString ? `/search?${queryString}` : '/search')
  }

  const clearAll = () => {
    router.push('/search')
  }

  const hasActiveFilters =
    Boolean(searchParams.get('q')) ||
    Boolean(activeCategory) ||
    Boolean(activeMinPrice) ||
    Boolean(activeMaxPrice) ||
    activeInStock ||
    activeSort !== 'newest'

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-blue-600 hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label htmlFor="sort" className="block text-sm font-medium mb-2">
          Sort By
        </label>
        <select
          id="sort"
          value={activeSort}
          onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? null : e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category
        </label>
        <select
          id="category"
          value={activeCategory}
          onChange={(e) => updateParams({ category: e.target.value || null })}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <span className="block text-sm font-medium mb-2">Price Range ($)</span>
        <PriceRangeInputs
          key={`${activeMinPrice}-${activeMaxPrice}`}
          initialMin={activeMinPrice}
          initialMax={activeMaxPrice}
          onApply={(min, max) =>
            updateParams({
              minPrice: min.trim() || null,
              maxPrice: max.trim() || null,
            })
          }
        />
      </div>

      {/* In-Stock Only */}
      <div className="pt-1">
        <label className="flex items-center gap-2.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={activeInStock}
            onChange={(e) => updateParams({ inStock: e.target.checked ? 'true' : null })}
            className="rounded border-gray-300 dark:border-gray-700"
          />
          <span>In-stock only</span>
        </label>
      </div>
    </aside>
  )
}
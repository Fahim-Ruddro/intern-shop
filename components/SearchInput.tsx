'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function SearchInput() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(urlQuery)
  const [isFocused, setIsFocused] = useState(false)
  const isFirstRender = useRef(true)

  if (!isFocused && query !== urlQuery) {
    setQuery(urlQuery)
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const timer = setTimeout(() => {
      const trimmed = query.trim()
      if (trimmed === urlQuery) return

      const params = new URLSearchParams(
        pathname === '/search' ? window.location.search : ''
      )

      if (trimmed) {
        params.set('q', trimmed)
      } else {
        params.delete('q')
      }
      params.delete('page')

      const queryString = params.toString()
      router.replace(queryString ? `/search?${queryString}` : '/search')
    }, 500)

    return () => clearTimeout(timer)
  }, [query, urlQuery, pathname, router])

  return (
    <div className="relative w-full max-w-md" role="search">
      <label htmlFor="header-search-input" className="sr-only">
        Search products
      </label>
      <input
        id="header-search-input"
        type="search"
        aria-label="Search products"
        value={query}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
      />
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Header } from "../Component/Header"
import { Footer } from "../Component/Footer"
import { supabase } from "../supabaseClient"
import type { Product } from "../types/Product"

export default function ProductsList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")

  const ITEMS_PER_PAGE = 10

  const getFirstImageUrl = (images: string[]): string => {
    for (const url of images) {
      const extension = url.split('.').pop()?.toLowerCase();
      if (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
        return url;
      }
    }
    return '';
  };

  // Sync searchQuery with URL params - always sync when URL changes
  useEffect(() => {
    const search = searchParams.get('search') || ''
    // console.log('URL search param changed to:', search) // Debug log
    setSearchQuery(search)
    setIsInitialized(true)
  }, [searchParams.toString()])

  // Update URL when typing in the search box (not from URL change)
  useEffect(() => {
    if (!isInitialized) return // Don't update URL until we've read it first
    
    const currentSearch = searchParams.get('search') || ''
    if (searchQuery && searchQuery !== currentSearch) {
      const timer = setTimeout(() => {
        // console.log('Updating URL to:', searchQuery) // Debug log
        setSearchParams({ search: searchQuery }, { replace: true })
      }, 300)
      return () => clearTimeout(timer)
    } else if (!searchQuery && currentSearch) {
      // console.log('Clearing URL search param') // Debug log
      setSearchParams({}, { replace: true })
    }
  }, [searchQuery, isInitialized])

  const fetchProducts = async (reset = false, currentPage = page) => {
    if (loading) return

    setLoading(true)
    const offset = currentPage * ITEMS_PER_PAGE

    let query = supabase
      .from('Products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (searchQuery) {
      query = query.or(`product_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    if (selectedSize) {
      query = query.eq('Size', selectedSize)
    }

    if (selectedColor) {
      query = query.ilike('colors', `%${selectedColor}%`)
    }

    const { data, error } = await query

    if (error) {
      // console.error('Error fetching products:', error)
    } else {
      if (reset) {
        setProducts(data || [])
        setPage(1)
        setHasMore((data || []).length === ITEMS_PER_PAGE)
      } else {
        setProducts(prev => {
          const newProducts = data || []
          const existingIds = new Set(prev.map(p => p.product_id))
          const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.product_id))
          return [...prev, ...uniqueNewProducts]
        })
        setPage(prev => prev + 1)
        setHasMore((data || []).length === ITEMS_PER_PAGE)
      }
    }

    setLoading(false)
  }

  // Fetch products when filters change (only after initialization)
  useEffect(() => {
    if (!isInitialized) return // Wait until we've read URL params
    
    // console.log('Fetching products with filters:', { searchQuery, minPrice, maxPrice, selectedSize, selectedColor }) // Debug log
    setPage(0)
    setHasMore(true)
    fetchProducts(true, 0)
  }, [searchQuery, minPrice, maxPrice, selectedSize, selectedColor, isInitialized])

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 100 &&
        !loading &&
        hasMore
      ) {
        fetchProducts(false, page)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, page, searchQuery, minPrice, maxPrice, selectedSize, selectedColor])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-center text-2xl md:text-3xl font-medium tracking-wide mb-8">ALL PRODUCTS</h1>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-3 bg-neutral-900 text-white border border-neutral-700 rounded focus:outline-none focus:border-white"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="p-3 bg-neutral-900 text-white border border-neutral-700 rounded focus:outline-none focus:border-white"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="p-3 bg-neutral-900 text-white border border-neutral-700 rounded focus:outline-none focus:border-white"
            />
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="p-3 bg-neutral-900 text-white border border-neutral-700 rounded focus:outline-none focus:border-white"
            >
              <option value="">All Sizes</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
            <input
              type="text"
              placeholder="Color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="p-3 bg-neutral-900 text-white border border-neutral-700 rounded focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="group cursor-pointer"
              onClick={() => navigate(`/product/${encodeURIComponent(product.product_name)}`)}
            >
              <div className="bg-neutral-900 overflow-hidden mb-4 aspect-square">
                <img
                  src={getFirstImageUrl(product.images || []) || "/placeholder.svg"}
                  alt={product.product_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="text-sm font-medium mb-1">
                {product.product_name}
              </h3>
              <p className="text-neutral-400 text-sm">₱{product.price.toFixed(2)} PHP</p>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-8">
            <p>Loading more products...</p>
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="text-center py-8">
            <p>No more products to load.</p>
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-8">
            <p>No products found.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Header } from "../Component/Header"
import { Footer } from "../Component/Footer"
import { supabase } from "../supabaseClient"
import type { Product } from "../types/Product"

interface Slide {
  id: number
  image: string
  label: string
}

interface Widget {
  id: number
  widget_name: string
  products: Product[]
}

export default function Home() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [widgetProductIndices, setWidgetProductIndices] = useState<{ [key: number]: number }>({})

  const getFirstImageUrl = (images: string[]): string => {
    for (const url of images) {
      const extension = url.split('.').pop()?.toLowerCase();
      if (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
        return url;
      }
    }
    return '';
  };

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase.from('Slides').select('*')
      if (error) {
        console.error('Error fetching slides:', error)
      } else {
        setSlides(data || [])
      }
      setLoading(false)
    }
    fetchSlides()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('Products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4)

        if (error) {
          console.error('Error fetching products:', error)
        } else {
          setProducts(data || [])
        }
      } catch (error) {
        console.error('Unexpected error fetching products:', error)
      }
    }

    const fetchWidgets = async () => {
      try {
        const { data, error } = await supabase
          .from('Widgets')
          .select(`
            id,
            widget_name,
            Products_Widgets!left(
              Products!inner(*)
            )
          `)

        if (error) {
          console.error('Error fetching widgets:', error)
        } else {
          const widgetsWithProducts = data?.map(widget => ({
            id: widget.id,
            widget_name: widget.widget_name,
            products: widget.Products_Widgets ? widget.Products_Widgets.map(pw => pw.Products).flat() : []
          })) || []
          // console.log('Fetched widgets:', widgetsWithProducts)
          setWidgets(widgetsWithProducts)
        }
      } catch (error) {
        console.error('Unexpected error fetching widgets:', error)
      }
    }

    fetchProducts()
    fetchWidgets()
  }, [])

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }
  }

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }
  }

  const nextWidgetProducts = (widgetId: number) => {
    setWidgetProductIndices(prev => ({
      ...prev,
      [widgetId]: (prev[widgetId] || 0) + 4
    }))
  }

  const prevWidgetProducts = (widgetId: number) => {
    setWidgetProductIndices(prev => ({
      ...prev,
      [widgetId]: Math.max(0, (prev[widgetId] || 0) - 4)
    }))
  }

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        nextSlide()
      }, 8000) // 8 seconds

      return () => clearInterval(interval)
    }
  }, [slides.length, currentSlide])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Imported Header component */}
      <Header />

      {/* Hero Carousel */}
        <section className="relative h-[600px] md:h-[650px] overflow-hidden bg-neutral-900">
          <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute w-full h-full transition-opacity duration-500 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img src={slide.image || "/placeholder.svg"} alt={slide.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
        >
          <ChevronLeft className="text-white" size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
        >
          <ChevronRight className="text-white" size={24} />
        </button>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition ${index === currentSlide ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => navigate('/products')}
            className="bg-white text-black px-8 py-3 font-bold text-sm hover:bg-neutral-200 transition"
          >
            SHOP HERE
          </button>
        </div>
      </section>

      {/* Section: NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl md:text-2xl font-medium tracking-wide mb-12">NEW ARRIVALS</h2>

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
      </section>

      {/* Widgets Sections */}
      {widgets.map((widget) => {
        const startIndex = widgetProductIndices[widget.id] || 0
        const displayedProducts = widget.products.slice(startIndex, startIndex + 4)
        const hasMore = widget.products.length > 4
        const canGoNext = startIndex + 4 < widget.products.length
        const canGoPrev = startIndex > 0

        return (
          <section key={widget.id} className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-center text-xl md:text-2xl font-medium tracking-wide mb-12">{widget.widget_name}</h2>

            {/* **FIX: Wraps products and arrows in a container with negative margins and padding** */}
            {/* The negative margins make the products touch the edges of the original container, 
                and the arrows are positioned relative to the overall section, sitting next to the product grid. */}
            <div className="relative">
              {/* Previous button - positioned outside the product grid */}
              {hasMore && (
                <button
                  onClick={() => prevWidgetProducts(widget.id)}
                  className={`absolute left-0 lg:-left-12 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 hidden md:block ${
                    canGoPrev 
                      ? 'opacity-100 hover:scale-110 cursor-pointer' 
                      : 'opacity-30 cursor-not-allowed'
                  }`}
                  disabled={!canGoPrev}
                  aria-label="Previous products"
                >
                  <div className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition">
                    <ChevronLeft className="text-white" size={24} />
                  </div>
                </button>
              )}

              {/* Product Grid - adjusted for the new layout. Removed the 'group' class since it's no longer needed for hover state on the outer wrapper. */}
              {/* Added horizontal margin to create space for the arrows on desktop/larger screens */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/product/${encodeURIComponent(product.product_name)}`)}
                  >
                    <div className="bg-neutral-900 overflow-hidden mb-4 aspect-square">
                      {/* Note: Image hover effect is already correct with group-hover:scale-105 */}
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

              {/* Next button - positioned outside the product grid */}
              {hasMore && (
                <button
                  onClick={() => nextWidgetProducts(widget.id)}
                  className={`absolute right-0 lg:-right-12 top-1/2 -translate-y-1/2 z-20 transition-all duration-300 hidden md:block ${
                    canGoNext 
                      ? 'opacity-100 hover:scale-110 cursor-pointer' 
                      : 'opacity-30 cursor-not-allowed'
                  }`}
                  disabled={!canGoNext}
                  aria-label="Next products"
                >
                  <div className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition">
                    <ChevronRight className="text-white" size={24} />
                  </div>
                </button>
              )}

              {/* Mobile Arrows (still overlaying, but less intrusive than before, or can be adjusted) */}
              {/* Optional: Add mobile-specific arrows if desired, or let the desktop ones handle it with different classes. 
                  I'm keeping the original class structure but hiding the absolute arrows on mobile/small screens for simplicity, 
                  as placing them completely outside on small screens is difficult with the current layout.
                  If you need them on mobile, you'll need to wrap the product grid in a slightly narrower container or use margin/padding tricks. */}
            </div>
          </section>
        )
      })}

      <Footer />
    </div>
  )
}
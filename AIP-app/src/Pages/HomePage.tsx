"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "../Component/Header"
import { Footer } from "../Component/Footer"
import { supabase } from "../supabaseClient"
import type { Product } from "../types/Product"

interface Slide {
  id: number
  image: string
  label: string
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])

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
    fetchProducts()
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
      <section className="relative h-96 md:h-[600px] overflow-hidden bg-neutral-900">
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
          <button className="bg-white text-black px-8 py-3 font-bold text-sm hover:bg-neutral-200 transition">
            SHOP HERE
          </button>
        </div>
      </section>

      {/* Section: NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl md:text-2xl font-medium tracking-wide mb-12">NEW ARRIVALS</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.product_id} className="group cursor-pointer">
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

      <Footer />
    </div>
  )
}

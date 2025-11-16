"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Header } from "../Component/Header"
import { Footer } from "../Component/Footer"
import { supabase } from "../supabaseClient"
import type { Product } from "../types/Product"

// Using window.setTimeout/clearTimeout to ensure correct type for SSR/Next.js environment
// This type definition is better for client components in Next.js
type TimeoutHandle = number | undefined; 

export default function ProductDetail() {
  const { product_name } = useParams<{ product_name: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  // Changed type annotation for consistency, though TypeScript infers 'number' in the browser
  const [autoAdvanceTimeout, setAutoAdvanceTimeout] = useState<TimeoutHandle>(undefined)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!product_name) return

      try {
        const { data, error } = await supabase
          .from('Products')
          .select('*')
          .eq('product_name', decodeURIComponent(product_name))
          .single()

        if (error) {
          console.error('Error fetching product:', error)
        } else {
          setProduct(data)
        }
      } catch (error) {
        console.error('Unexpected error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [product_name])

  // Check if current media is a video
  const isVideo = (url: string) => {
    // Note: You might need to adjust the videoExtensions if you host videos differently (e.g., streaming URLs)
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv']
    // A robust check: check for common video extensions or specific video URL patterns (like YouTube embeds)
    const urlLower = url.toLowerCase();
    return videoExtensions.some(ext => urlLower.includes(ext));
  }

  const images = product?.images || []
  const currentImage = images[currentImageIndex] || "/placeholder.svg"
  const currentIsVideo = isVideo(currentImage)

  // --- Manual Navigation Functions ---
  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const handleVideoEnd = () => {
    // Clear any existing timeout (though it should be null for videos)
    if (autoAdvanceTimeout !== undefined) {
      clearTimeout(autoAdvanceTimeout)
      setAutoAdvanceTimeout(undefined)
    }
    // Advance to the next item
    nextImage()
  }

  // --- Auto-advance logic (8 seconds for images) ---
  useEffect(() => {
    if (images.length <= 1) return

    // Cleanup function definition
    const clearCurrentTimeout = () => {
      if (autoAdvanceTimeout !== undefined) {
        clearTimeout(autoAdvanceTimeout)
      }
    }

    // Clear existing timeout before setting a new one
    clearCurrentTimeout();

    if (currentIsVideo) {
      // For videos, the advancement is handled by the `onEnded` prop on the <video> element
      // No need to set a timer here.
      setAutoAdvanceTimeout(undefined)
      return
    } else {
      // For images, advance after 8 seconds
      const timeoutId = window.setTimeout(() => {
        nextImage()
      }, 8000)
      
      // Store the new timeout ID
      setAutoAdvanceTimeout(timeoutId)
      
      // The return function serves as the cleanup when the component unmounts 
      // or dependencies change.
      return () => {
        clearTimeout(timeoutId)
      }
    }
    
    // Dependencies: currentImageIndex and images.length for the logic to re-run on slide change,
    // currentIsVideo to apply the correct logic (timer vs video event)
  }, [currentImageIndex, images.length, currentIsVideo]) 


  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!product) {
    // ... (rest of the not found component)
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-black px-6 py-2 font-bold hover:bg-neutral-200 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="relative">
            <div className="aspect-square bg-neutral-900 overflow-hidden mb-4">
              {currentIsVideo ? (
                <video
                  src={currentImage}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted // Muted is required for autoplay in most browsers
                  onEnded={handleVideoEnd} // <-- Video auto-advance on end
                  controls={false}
                />
              ) : (
                <img
                  src={currentImage}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                {/* 1. ADDED: Previous Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full transition z-10"
                >
                  <ChevronLeft className="text-white" size={24} />
                </button>

                {/* 2. Existing Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full transition z-10"
                >
                  <ChevronRight className="text-white" size={24} />
                </button>

                {/* Image Dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        index === currentImageIndex ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">{product.product_name}</h1>

            <div className="text-2xl font-semibold">
              ₱{product.price.toFixed(2)} PHP
              {product.is_sale && product.sales_price && (
                <span className="ml-4 text-lg text-red-400 line-through">
                  ₱{product.sales_price.toFixed(2)} PHP
                </span>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="text-neutral-300 leading-relaxed">
                {product.description}
              </p>
              {product.short_description && (
                <p className="text-neutral-400 text-sm">
                  {product.short_description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Size:</span>
                <span className="text-neutral-300">{product.Size}</span>
              </div>

              {product.colors && (
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Colors:</span>
                  <span className="text-neutral-300">{product.colors}</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <span className="font-semibold">Stock:</span>
                <span className={`text-neutral-300 ${product.is_in_stock ? 'text-green-400' : 'text-red-400'}`}>
                  {product.is_in_stock ? `${product.stock_quantity} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            <button
              className={`w-full py-4 font-bold text-lg transition ${
                product.is_in_stock
                  ? 'bg-white text-black hover:bg-neutral-200'
                  : 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
              }`}
              disabled={!product.is_in_stock}
            >
              {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
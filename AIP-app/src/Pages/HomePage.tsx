"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "../Component/Header"
import { Footer } from "../Component/Footer"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      image: "/streetwear-brand-hero-dark.jpg",
      label: "HOLIDAY COLLECTION 2024",
    },
    {
      id: 2,
      image: "/urban-fashion-dark-aesthetic.jpg",
      label: "NEW SEASON DROP",
    },
    {
      id: 3,
      image: "/streetwear-apparel-black.jpg",
      label: "EXCLUSIVE RELEASE",
    },
  ]

  const products = [
    { id: 1, name: "Eye Candy Tee", color: "Black", price: "₱1,000.00", image: "/black-tshirt-streetwear.jpg" },
    { id: 2, name: "Eye Candy Tee", color: "White", price: "₱1,000.00", image: "/white-tshirt-streetwear.jpg" },
    { id: 3, name: "+RAP Saved My Life", color: "Black", price: "₱1,000.00", image: "/black-graphic-tee.jpg" },
    { id: 4, name: "+RAP Saved My Life", color: "White", price: "₱1,000.00", image: "/white-graphic-tee.jpg" },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 8000) // 10 seconds

    return () => clearInterval(interval)
  }, [currentSlide])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Imported Header component */}
      <Header />

      {/* Hero Carousel */}
      <section className="relative h-96 md:h-[600px] overflow-hidden bg-neutral-900 mt-[73px]">
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

      {/* Section: Halloween Quick Release */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl md:text-2xl font-medium tracking-wide mb-12">HALLOWEEN QUICK RELEASE</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, 2).map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="bg-neutral-900 overflow-hidden mb-4 aspect-square">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="text-sm font-medium mb-1">
                {product.name} in {product.color}
              </h3>
              <p className="text-neutral-400 text-sm">{product.price} PHP</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section: +RAP Saved My Life */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl md:text-2xl font-medium tracking-wide mb-12">+RAP SAVED MY LIFE</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(2, 4).map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="bg-neutral-900 overflow-hidden mb-4 aspect-square">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="text-sm font-medium mb-1">
                {product.name} in {product.color}
              </h3>
              <p className="text-neutral-400 text-sm">{product.price} PHP</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

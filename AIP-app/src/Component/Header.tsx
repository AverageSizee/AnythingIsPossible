import { Search, User, ShoppingCart } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"

export function Header() {
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearchValue("")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSearch = () => {
    const trimmedValue = searchValue.trim()
    console.log('Searching for:', trimmedValue) // Debug log
    
    if (trimmedValue) {
      const searchUrl = `/products?search=${encodeURIComponent(trimmedValue)}`
      console.log('Navigating to:', searchUrl) // Debug log
      navigate(searchUrl, { replace: false })
    } else {
      navigate('/products', { replace: false })
    }
  }

  // Search as you type with debounce
  useEffect(() => {
    const trimmedValue = searchValue.trim()
    if (!trimmedValue) return

    const timer = setTimeout(() => {
      const searchUrl = `/products?search=${encodeURIComponent(trimmedValue)}`
      console.log('Auto-navigating to:', searchUrl) // Debug log
      navigate(searchUrl, { replace: false })
    }, 800)

    return () => clearTimeout(timer)
  }, [searchValue, navigate])

  return (
    <header className="border-b border-neutral-800 sticky top-0 z-50 bg-black">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-wider cursor-pointer" onClick={() => navigate('/')}>AIP</div>

        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/') }} className="hover:text-neutral-400 transition">
            HOME
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/products') }} className="hover:text-neutral-400 transition">
            SHOP
          </a>
          <a href="#" className="hover:text-neutral-400 transition">
            FUNDA®
          </a>
          <a href="#" className="hover:text-neutral-400 transition">
            SIZE CHART
          </a>
          <a href="#" className="hover:text-neutral-400 transition">
            CONTACT US
          </a>
          <a href="#" className="hover:text-neutral-400 transition">
            ABOUT US
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className={`bg-neutral-900 text-white border border-neutral-700 rounded-l px-3 py-1 focus:outline-none focus:border-white transition-all duration-300 ${
                isSearchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
              }`}
            />
            <button onClick={handleSearchClick} className="hover:text-neutral-400 transition px-2 py-1">
              <Search size={20} />
            </button>
          </div>
          <button className="hover:text-neutral-400 transition">
            <User size={20} />
          </button>
          <button className="hover:text-neutral-400 transition">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
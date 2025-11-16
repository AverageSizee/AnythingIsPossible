import { Search, User, ShoppingCart } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Header() {
  const navigate = useNavigate()

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
          <button className="hover:text-neutral-400 transition">
            <Search size={20} />
          </button>
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

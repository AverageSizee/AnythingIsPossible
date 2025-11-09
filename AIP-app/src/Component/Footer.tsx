export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold mb-4 text-sm">SHOP</h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  All Products
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Collections
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-sm">HELP</h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-sm">ABOUT</h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Press
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-sm">FOLLOW</h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-8 text-center text-xs text-neutral-500">
          <p>&copy; 2025 UNDRAFTED. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

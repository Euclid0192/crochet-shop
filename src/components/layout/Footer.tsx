import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-pink-100 border-t border-pink-200 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧶</span>
              <span className="font-display text-lg font-bold text-gray-800">Cozy Loops</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Handmade crochet items crafted with love. Each piece is unique and made to order.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-pink-400 transition-colors">All Products</Link></li>
              <li><Link href="/cart" className="hover:text-pink-400 transition-colors">My Cart</Link></li>
              <li><Link href="/account/orders" className="hover:text-pink-400 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/auth/login" className="hover:text-pink-400 transition-colors">Sign In</Link></li>
              <li><Link href="/auth/register" className="hover:text-pink-400 transition-colors">Create Account</Link></li>
              <li><Link href="/account" className="hover:text-pink-400 transition-colors">My Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pink-200 mt-8 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Cozy Loops. All rights reserved. Made with 💕
        </div>
      </div>
    </footer>
  )
}

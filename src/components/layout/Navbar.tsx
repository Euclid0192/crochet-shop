'use client'

import Link from 'next/link'
import { ShoppingBag, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  userEmail?: string | null
  isAdmin?: boolean
}

export function Navbar({ userEmail, isAdmin }: NavbarProps) {
  const { totalItems, openDrawer } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-pink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🧶</span>
          <span className="font-display text-xl font-bold text-gray-800">Cozy Loops</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-pink-300 transition-colors">Shop</Link>
          <Link href="/#about" className="hover:text-pink-300 transition-colors">About</Link>
          {isAdmin && (
            <Link href="/admin" className="text-pink-300 hover:text-pink-400 transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <button
            onClick={openDrawer}
            className="relative p-2 rounded-full hover:bg-pink-50 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag size={22} className="text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-pink-200 text-gray-800 text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {/* Auth */}
          {userEmail ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-pink-50 text-sm text-gray-700 transition-colors"
              >
                <User size={16} />
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 px-2 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium bg-pink-200 text-gray-800 px-4 py-1.5 rounded-full hover:bg-pink-300 transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-pink-50 transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white px-4 py-4 flex flex-col gap-3 text-sm font-medium">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-gray-700 py-1">Shop</Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)} className="text-gray-700 py-1">About</Link>
          {isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-pink-300 py-1">Admin</Link>
          )}
          {userEmail ? (
            <>
              <Link href="/account" onClick={() => setMenuOpen(false)} className="text-gray-700 py-1">My Account</Link>
              <button onClick={handleLogout} className="text-left text-gray-500 py-1">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-gray-700 py-1">Sign in</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="text-gray-700 py-1">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

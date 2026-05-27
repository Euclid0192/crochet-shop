'use client'

import { X, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { CartItem } from './CartItem'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function CartDrawer() {
  const { items, isOpen, closeDrawer, subtotalCents } = useCart()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-pink-300" />
            <h2 className="font-display font-semibold text-gray-800">Your Cart</h2>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <span className="text-5xl">🧶</span>
              <p className="text-gray-500">Your cart is empty.</p>
              <Button variant="secondary" onClick={closeDrawer}>
                Keep Shopping
              </Button>
            </div>
          ) : (
            items.map(item => (
              <CartItem key={item.product.id} item={item} />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-pink-100 px-6 py-4 space-y-3 bg-pink-50">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">{formatPrice(subtotalCents)}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping calculated at checkout</p>
            <Link href="/checkout" onClick={closeDrawer}>
              <Button className="w-full" size="lg">
                Checkout
              </Button>
            </Link>
            <Link href="/cart" onClick={closeDrawer}>
              <Button variant="ghost" className="w-full">
                View Full Cart
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

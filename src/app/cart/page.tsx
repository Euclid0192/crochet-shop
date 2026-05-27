'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { CartItem } from '@/components/cart/CartItem'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function CartPage() {
  const { items, subtotalCents, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingBag size={56} className="mx-auto text-pink-200 mb-6" />
        <h1 className="font-display text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/">
          <Button size="lg">Browse Products</Button>
        </Link>
      </div>
    )
  }

  const shipping = subtotalCents >= 5000 ? 0 : 599
  const total = subtotalCents + shipping

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="bg-white rounded-2xl border border-pink-100 p-4">
              <CartItem item={item} />
            </div>
          ))}
          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Free shipping on orders over $50</p>
              )}
              <div className="border-t border-pink-100 pt-2 flex justify-between font-semibold text-gray-800 text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Link href="/checkout">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

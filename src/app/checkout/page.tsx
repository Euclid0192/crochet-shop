'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { ShippingForm } from '@/components/checkout/ShippingForm'
import { Card } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, subtotalCents, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  const shipping = subtotalCents >= 5000 ? 0 : 599
  const total = subtotalCents + shipping

  async function handleShippingSubmit(address: { name: string; email: string; line1: string; line2?: string; city: string; state: string; postal_code: string; country: string }) {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        shippingAddress: address,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    clearCart()
    window.location.href = data.url
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Shipping form */}
        <div className="lg:col-span-3">
          <Card>
            <h2 className="font-semibold text-gray-800 mb-5">Shipping Information</h2>
            <p className="text-sm text-gray-500 mb-5">
              You can checkout as a guest or{' '}
              <Link href="/auth/login?next=/checkout" className="text-pink-300 hover:underline">
                sign in
              </Link>{' '}
              to save your address.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}
            <ShippingForm onSubmit={handleShippingSubmit} loading={loading} />
          </Card>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                    <Image
                      src={item.product.images[0] ?? '/images/placeholder.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(item.product.price_cents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-pink-100 pt-3 space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800 text-base pt-1 border-t border-pink-100">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Secure payment via Stripe 🔒
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

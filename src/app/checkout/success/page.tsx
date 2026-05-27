import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { StatusBadge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { Order, OrderItem } from '@/types'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) redirect('/')

  let order: Order | null = null
  let items: OrderItem[] = []

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (!session) redirect('/')

    const supabase = createAdminClient()
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('stripe_session_id', session_id)
      .single()

    if (data) {
      const { order_items, ...orderData } = data as { order_items: OrderItem[] } & Order
      order = orderData
      items = order_items ?? []
    }
  } catch {
    redirect('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-500" />
      </div>

      <h1 className="font-display text-3xl font-bold text-gray-800 mb-3">Order Confirmed!</h1>
      <p className="text-gray-500 mb-8">
        Thank you for your order. We&apos;ll send a confirmation email shortly.
      </p>

      {order && (
        <div className="bg-white rounded-2xl border border-pink-100 p-6 text-left mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono text-sm text-gray-800">{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {items.length > 0 && (
            <div className="border-t border-pink-100 pt-4 space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.unit_price_cents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-pink-100 pt-3 flex justify-between font-semibold text-gray-800">
            <span>Total</span>
            <span>{order && formatPrice(order.total_cents)}</span>
          </div>

          <div className="mt-4 p-3 bg-sky-50 rounded-xl text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-1">
              <Package size={16} className="text-sky-400" />
              <span className="font-medium">Shipping to</span>
            </div>
            <p>{order.shipping_name}</p>
            <p>{order.shipping_line1}, {order.shipping_city}, {order.shipping_state} {order.shipping_postal}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {order && (
          <Link href={`/account/orders/${order.id}`}>
            <Button variant="secondary">Track Order</Button>
          </Link>
        )}
        <Link href="/">
          <Button variant="ghost">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}

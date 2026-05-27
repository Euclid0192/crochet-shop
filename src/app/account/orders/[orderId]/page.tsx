import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { OrderTrackingTimeline } from '@/components/account/OrderTrackingTimeline'
import { formatPrice } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import type { Order, OrderItem, ShippingUpdate } from '@/types'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?next=/account/orders/${orderId}`)

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*), shipping_updates(*)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!data) notFound()

  const { order_items, shipping_updates, ...orderData } = data as {
    order_items: OrderItem[]
    shipping_updates: ShippingUpdate[]
  } & Order

  const updates = (shipping_updates ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">
            Order #{orderData.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Placed {new Date(orderData.created_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>
        <StatusBadge status={orderData.status} />
      </div>

      <div className="space-y-5">
        {/* Items */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">Items</h2>
          <div className="space-y-3">
            {(order_items ?? []).map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.product_name} × {item.quantity}
                </span>
                <span className="font-medium text-gray-800">
                  {formatPrice(item.unit_price_cents * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-pink-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(orderData.subtotal_cents)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>{orderData.shipping_cents === 0 ? 'Free' : formatPrice(orderData.shipping_cents)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800">
                <span>Total</span>
                <span>{formatPrice(orderData.total_cents)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Shipping address */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Package size={18} className="text-sky-400" />
            <h2 className="font-semibold text-gray-800">Shipping Address</h2>
          </div>
          <p className="text-sm text-gray-600">{orderData.shipping_name}</p>
          <p className="text-sm text-gray-600">{orderData.shipping_line1}</p>
          {orderData.shipping_line2 && (
            <p className="text-sm text-gray-600">{orderData.shipping_line2}</p>
          )}
          <p className="text-sm text-gray-600">
            {orderData.shipping_city}, {orderData.shipping_state} {orderData.shipping_postal}
          </p>
          {orderData.tracking_number && (
            <div className="mt-3 p-2 bg-sky-50 rounded-lg">
              <p className="text-xs text-gray-500">Tracking</p>
              <p className="text-sm font-medium text-sky-600">
                {orderData.carrier && `${orderData.carrier}: `}{orderData.tracking_number}
              </p>
            </div>
          )}
        </Card>

        {/* Tracking timeline */}
        {updates.length > 0 && (
          <Card>
            <h2 className="font-semibold text-gray-800 mb-5">Order Updates</h2>
            <OrderTrackingTimeline updates={updates} />
          </Card>
        )}
      </div>
    </div>
  )
}

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { OrderTrackingTimeline } from '@/components/account/OrderTrackingTimeline'
import { OrderStatusForm } from '@/components/admin/OrderStatusForm'
import { formatPrice } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import type { Order, OrderItem, ShippingUpdate } from '@/types'

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*), shipping_updates(*)')
    .eq('id', orderId)
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/admin"
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
            {new Date(orderData.created_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <StatusBadge status={orderData.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Customer info */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-3">Customer</h2>
          <p className="text-sm text-gray-700">{orderData.shipping_name}</p>
          <p className="text-sm text-sky-500">{orderData.shipping_email}</p>
          <div className="mt-3 text-sm text-gray-600">
            <p>{orderData.shipping_line1}</p>
            {orderData.shipping_line2 && <p>{orderData.shipping_line2}</p>}
            <p>{orderData.shipping_city}, {orderData.shipping_state} {orderData.shipping_postal}</p>
          </div>
        </Card>

        {/* Order items */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-3">Items</h2>
          <div className="space-y-2">
            {(order_items ?? []).map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.product_name} × {item.quantity}</span>
                <span className="font-medium">{formatPrice(item.unit_price_cents * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-pink-100 pt-2 flex justify-between font-semibold text-gray-800">
              <span>Total</span>
              <span>{formatPrice(orderData.total_cents)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Update form */}
      <Card className="mb-6">
        <h2 className="font-semibold text-gray-800 mb-5">Update Order</h2>
        <OrderStatusForm order={orderData as Order} />
      </Card>

      {/* Timeline */}
      {updates.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-5">History</h2>
          <OrderTrackingTimeline updates={updates} />
        </Card>
      )}
    </div>
  )
}

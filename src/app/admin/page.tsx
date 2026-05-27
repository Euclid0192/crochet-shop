import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Package, TrendingUp, Clock, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import type { Order } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const allOrders = (orders as Order[]) ?? []
  const stats = {
    total: allOrders.length,
    pending: allOrders.filter(o => o.status === 'pending' || o.status === 'processing').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    revenue: allOrders
      .filter(o => o.status !== 'pending')
      .reduce((sum, o) => sum + o.total_cents, 0),
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: TrendingUp, label: 'Revenue', value: formatPrice(stats.revenue), color: 'text-green-500', bg: 'bg-green-50' },
          { icon: Package, label: 'Total Orders', value: stats.total, color: 'text-sky-500', bg: 'bg-sky-50' },
          { icon: Clock, label: 'To Process', value: stats.pending, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { icon: Truck, label: 'Shipped', value: stats.shipped, color: 'text-pink-400', bg: 'bg-pink-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="p-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
          </Card>
        ))}
      </div>

      {/* Orders table */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-4">All Orders</h2>

        {allOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-pink-100">
            <Package size={40} className="mx-auto mb-4 opacity-40" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pink-100 bg-pink-50">
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Order</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Total</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map((order, i) => (
                    <tr
                      key={order.id}
                      className={`border-b border-pink-50 hover:bg-pink-50/50 transition-colors ${
                        i === allOrders.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-mono text-gray-800">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{order.shipping_email}</td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {formatPrice(order.total_cents)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-pink-300 hover:text-pink-400 font-medium"
                        >
                          Manage <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

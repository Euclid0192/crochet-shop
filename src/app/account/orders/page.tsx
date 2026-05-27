import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import type { Order } from '@/types'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/account/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-800">My Account</h1>
        <p className="text-gray-500 text-sm mt-1">{user.email}</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-pink-100 pb-4">
        <Link
          href="/account"
          className="text-sm font-medium text-gray-500 hover:text-gray-800 pb-3 transition-colors"
        >
          Profile
        </Link>
        <Link
          href="/account/orders"
          className="text-sm font-medium text-gray-800 border-b-2 border-pink-200 pb-3"
        >
          Orders
        </Link>
      </div>

      <h2 className="font-semibold text-gray-800 mb-4">Order History</h2>

      {(!orders || orders.length === 0) ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-4xl block mb-4">📦</span>
          <p className="mb-4">No orders yet.</p>
          <Link href="/" className="text-pink-300 hover:underline text-sm">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(orders as Order[]).map(order => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-pink-100 hover:border-pink-200 hover:shadow-soft transition-all p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-gray-800 font-medium">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-semibold text-gray-800">{formatPrice(order.total_cents)}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

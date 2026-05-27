'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui/Input'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Order, OrderStatus } from '@/types'

export function OrderStatusForm({ order }: { order: Order }) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [carrier, setCarrier] = useState(order.carrier ?? '')
  const [tracking, setTracking] = useState(order.tracking_number ?? '')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, carrier, tracking_number: tracking, note }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Update failed')
    } else {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        router.refresh()
      }, 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="status"
        label="Order Status"
        value={status}
        onChange={e => setStatus(e.target.value as OrderStatus)}
      >
        <option value="pending">Pending</option>
        <option value="paid">Payment Confirmed</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
      </Select>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="carrier"
          label="Carrier"
          placeholder="USPS, UPS, FedEx..."
          value={carrier}
          onChange={e => setCarrier(e.target.value)}
        />
        <Input
          id="tracking"
          label="Tracking Number"
          placeholder="1Z999AA10123456784"
          value={tracking}
          onChange={e => setTracking(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="note" className="text-sm font-medium text-gray-700">
          Note to customer (optional)
        </label>
        <textarea
          id="note"
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-200 resize-none"
          placeholder="e.g. Your order has been shipped via USPS Priority Mail"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" loading={loading}>
        {success ? '✓ Updated!' : 'Update Order'}
      </Button>
    </form>
  )
}

import { Package, CreditCard, Settings, Truck, CheckCircle } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '@/lib/utils'
import type { ShippingUpdate } from '@/types'

const STATUS_ICONS = {
  pending: Package,
  paid: CreditCard,
  processing: Settings,
  shipped: Truck,
  delivered: CheckCircle,
}

export function OrderTrackingTimeline({ updates }: { updates: ShippingUpdate[] }) {
  if (updates.length === 0) return null

  return (
    <div className="space-y-0">
      {updates.map((update, i) => {
        const Icon = STATUS_ICONS[update.status] ?? Package
        const isLatest = i === 0

        return (
          <div key={update.id} className="flex gap-4 relative">
            {/* Line */}
            {i < updates.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-pink-100" />
            )}

            {/* Icon */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isLatest ? 'bg-pink-200' : 'bg-gray-100'
            }`}>
              <Icon size={18} className={isLatest ? 'text-gray-800' : 'text-gray-400'} />
            </div>

            {/* Content */}
            <div className="pb-6 flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${isLatest ? 'text-gray-800' : 'text-gray-500'}`}>
                  {ORDER_STATUS_LABELS[update.status]}
                </p>
                {isLatest && (
                  <span className="text-xs bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              {update.message && (
                <p className="text-sm text-gray-500 mt-0.5">{update.message}</p>
              )}
              {update.tracking_number && (
                <p className="text-xs text-sky-500 mt-1">
                  Tracking: {update.tracking_number}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(update.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { cn, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils'
import type { OrderStatus } from '@/types'

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-medium', ORDER_STATUS_COLORS[status])}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Payment Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  paid: 'bg-sky-100 text-sky-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-pink-100 text-pink-700',
  delivered: 'bg-green-100 text-green-700',
}

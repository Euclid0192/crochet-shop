'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/types'

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQty, removeItem } = useCart()
  const image = item.product.images[0] ?? '/images/placeholder.png'

  return (
    <div className="flex gap-3">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
        <Image src={image} alt={item.product.name} fill className="object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
        <p className="text-sm text-gray-500">{formatPrice(item.product.price_cents)}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-200 rounded-full text-xs">
            <button
              onClick={() => updateQty(item.product.id, item.quantity - 1)}
              className="px-2 py-1 hover:bg-gray-50 rounded-l-full"
            >
              <Minus size={12} />
            </button>
            <span className="px-2">{item.quantity}</span>
            <button
              onClick={() => updateQty(item.product.id, item.quantity + 1)}
              className="px-2 py-1 hover:bg-gray-50 rounded-r-full"
              disabled={item.quantity >= item.product.stock_qty}
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.product.id)}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

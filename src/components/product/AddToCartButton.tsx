'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  function handleAdd() {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Quantity</span>
        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="px-4 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(product.stock_qty, q + 1))}
            className="px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <Button
        onClick={handleAdd}
        disabled={product.stock_qty === 0}
        size="lg"
        className="w-full"
      >
        {added ? (
          <>
            <Check size={18} />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingBag size={18} />
            {product.stock_qty === 0 ? 'Sold Out' : 'Add to Cart'}
          </>
        )}
      </Button>
    </div>
  )
}

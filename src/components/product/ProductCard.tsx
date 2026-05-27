'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const image = product.images[0] ?? '/images/placeholder.png'

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-pink-100 hover:border-pink-200 hover:shadow-soft transition-all duration-300">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-pink-50">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {product.stock_qty === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">Sold Out</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-800 hover:text-pink-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        {product.category && (
          <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-gray-800">{formatPrice(product.price_cents)}</span>
          <button
            onClick={() => addItem(product)}
            disabled={product.stock_qty === 0}
            className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

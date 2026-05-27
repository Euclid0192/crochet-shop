import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import type { Product } from '@/types'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const p = product as Product
  const images = p.images.length > 0 ? p.images : ['/images/placeholder.png']

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-pink-50">
            <Image
              src={images[0]}
              alt={p.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-pink-50">
                  <Image src={img} alt={`${p.name} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {p.category && (
            <span className="inline-block text-xs font-medium bg-sky-100 text-sky-600 px-3 py-1 rounded-full w-fit">
              {p.category}
            </span>
          )}

          <h1 className="font-display text-3xl font-bold text-gray-800">{p.name}</h1>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-800">{formatPrice(p.price_cents)}</span>
            {p.stock_qty > 0 ? (
              <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                In Stock ({p.stock_qty} left)
              </span>
            ) : (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Sold Out
              </span>
            )}
          </div>

          {p.description && (
            <p className="text-gray-600 leading-relaxed">{p.description}</p>
          )}

          <div className="border-t border-pink-100 pt-5">
            <AddToCartButton product={p} />
          </div>

          <div className="bg-sky-50 rounded-2xl p-4 space-y-2 text-sm text-gray-600">
            <p>🕐 <strong>Made to order</strong> — allow 1–2 weeks</p>
            <p>📦 <strong>Free shipping</strong> on orders over $50</p>
            <p>💌 Handwritten note included</p>
          </div>
        </div>
      </div>
    </div>
  )
}

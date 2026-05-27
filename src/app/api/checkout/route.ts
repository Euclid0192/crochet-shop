import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { ShippingAddress } from '@/types'

interface CartItemInput {
  productId: string
  quantity: number
}

export async function POST(request: NextRequest) {
  const { cartItems, shippingAddress } = await request.json() as {
    cartItems: CartItemInput[]
    shippingAddress: ShippingAddress
  }

  if (!cartItems?.length || !shippingAddress) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Get current user (may be null for guest checkout)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Validate products and prices from DB (never trust client prices)
  const supabaseAdmin = createAdminClient()
  const productIds = cartItems.map(i => i.productId)

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, name, price_cents, stock_qty, images, is_active')
    .in('id', productIds)
    .eq('is_active', true)

  if (!products || products.length !== productIds.length) {
    return Response.json({ error: 'One or more products are unavailable' }, { status: 400 })
  }

  // Check stock
  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId)
    if (!product) return Response.json({ error: 'Product not found' }, { status: 400 })
    if (product.stock_qty < item.quantity) {
      return Response.json({ error: `"${product.name}" has insufficient stock` }, { status: 400 })
    }
  }

  // Build Stripe line items
  const lineItems = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId)!
    return {
      price_data: {
        currency: 'usd',
        unit_amount: product.price_cents,
        product_data: {
          name: product.name,
          images: product.images.length > 0 ? [product.images[0]] : [],
        },
      },
      quantity: item.quantity,
    }
  })

  const subtotalCents = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)!
    return sum + product.price_cents * item.quantity
  }, 0)
  const shippingCents = subtotalCents >= 5000 ? 0 : 599

  // Add shipping as a line item if applicable
  if (shippingCents > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        unit_amount: shippingCents,
        product_data: { name: 'Shipping', images: [] },
      },
      quantity: 1,
    })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: shippingAddress.email,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout`,
    metadata: {
      userId: user?.id ?? '',
      shippingJson: JSON.stringify(shippingAddress),
      cartJson: JSON.stringify(
        cartItems.map(item => {
          const product = products.find(p => p.id === item.productId)!
          return {
            productId: item.productId,
            productName: product.name,
            productImage: product.images[0] ?? '',
            unitPriceCents: product.price_cents,
            quantity: item.quantity,
          }
        })
      ),
      subtotalCents: String(subtotalCents),
      shippingCents: String(shippingCents),
    },
  })

  return Response.json({ url: session.url })
}

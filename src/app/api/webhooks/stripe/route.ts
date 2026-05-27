import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return Response.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const metadata = session.metadata ?? {}

  const shipping = JSON.parse(metadata.shippingJson ?? '{}')
  const cartItems = JSON.parse(metadata.cartJson ?? '[]') as Array<{
    productId: string
    productName: string
    productImage: string
    unitPriceCents: number
    quantity: number
  }>

  const supabase = createAdminClient()

  // Idempotency: check if order already exists
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single()

  if (existing) return Response.json({ received: true })

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: metadata.userId || null,
      guest_email: session.customer_email,
      shipping_name: shipping.name,
      shipping_email: shipping.email,
      shipping_line1: shipping.line1,
      shipping_line2: shipping.line2 ?? null,
      shipping_city: shipping.city,
      shipping_state: shipping.state,
      shipping_postal: shipping.postal_code,
      shipping_country: shipping.country ?? 'US',
      subtotal_cents: Number(metadata.subtotalCents),
      shipping_cents: Number(metadata.shippingCents),
      total_cents: session.amount_total ?? 0,
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string | null,
      status: 'paid',
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Failed to create order:', orderError)
    return Response.json({ error: 'Order creation failed' }, { status: 500 })
  }

  // Create order items
  await supabase.from('order_items').insert(
    cartItems.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage || null,
      unit_price_cents: item.unitPriceCents,
      quantity: item.quantity,
    }))
  )

  // Create initial shipping update
  await supabase.from('shipping_updates').insert({
    order_id: order.id,
    status: 'paid',
    message: 'Payment confirmed. Your order is being prepared.',
  })

  return Response.json({ received: true })
}

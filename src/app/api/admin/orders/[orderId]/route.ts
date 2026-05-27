import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { OrderStatus } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params

  // Verify admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { status, carrier, tracking_number, note } = await request.json() as {
    status: OrderStatus
    carrier?: string
    tracking_number?: string
    note?: string
  }

  const supabaseAdmin = createAdminClient()

  // Update order
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status,
      carrier: carrier || null,
      tracking_number: tracking_number || null,
    })
    .eq('id', orderId)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  // Add shipping update entry
  await supabaseAdmin.from('shipping_updates').insert({
    order_id: orderId,
    status,
    message: note || null,
    tracking_number: tracking_number || null,
    updated_by: user.id,
  })

  return Response.json({ success: true })
}

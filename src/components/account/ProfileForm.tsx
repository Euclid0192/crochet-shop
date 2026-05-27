'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export function ProfileForm({ profile }: { profile: Profile }) {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile.full_name ?? '',
      phone: profile.phone ?? '',
      address_line1: profile.address_line1 ?? '',
      address_line2: profile.address_line2 ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      postal_code: profile.postal_code ?? '',
      country: profile.country ?? 'US',
    },
  })

  async function onSubmit(data: FormValues) {
    setError(null)
    const { error: err } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', profile.id)

    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="full_name"
          label="Full Name"
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          id="phone"
          label="Phone (optional)"
          type="tel"
          {...register('phone')}
        />
      </div>

      <Input
        id="address_line1"
        label="Address"
        {...register('address_line1')}
      />
      <Input
        id="address_line2"
        label="Apt, Suite, etc."
        {...register('address_line2')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input id="city" label="City" {...register('city')} />
        <Input id="state" label="State" {...register('state')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input id="postal_code" label="Postal Code" {...register('postal_code')} />
        <Select id="country" label="Country" {...register('country')}>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="AU">Australia</option>
        </Select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" loading={isSubmitting}>
        {saved ? '✓ Saved!' : 'Save Changes'}
      </Button>
    </form>
  )
}

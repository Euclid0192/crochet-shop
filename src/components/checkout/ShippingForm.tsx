'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ShippingAddress } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  line1: z.string().min(3, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(4, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<ShippingAddress>
  onSubmit: (data: FormValues) => void
  loading?: boolean
}

export function ShippingForm({ defaultValues, onSubmit, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'US', ...defaultValues },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="name"
          label="Full Name"
          placeholder="Jane Smith"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <Input
        id="line1"
        label="Address"
        placeholder="123 Main St"
        error={errors.line1?.message}
        {...register('line1')}
      />
      <Input
        id="line2"
        label="Apt, Suite, etc. (optional)"
        placeholder="Apt 4B"
        {...register('line2')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="city"
          label="City"
          placeholder="New York"
          error={errors.city?.message}
          {...register('city')}
        />
        <Input
          id="state"
          label="State"
          placeholder="NY"
          error={errors.state?.message}
          {...register('state')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="postal_code"
          label="Postal Code"
          placeholder="10001"
          error={errors.postal_code?.message}
          {...register('postal_code')}
        />
        <Select id="country" label="Country" {...register('country')}>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="AU">Australia</option>
        </Select>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Continue to Payment
      </Button>
    </form>
  )
}

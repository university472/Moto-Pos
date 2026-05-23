// frontend/src/app/(admin)/settings/page.tsx
// Shop settings — name, address, phone, invoice footer, tax.
// Changes here reflect on all new invoices immediately.

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Loader2, Save } from 'lucide-react'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const settingsSchema = z.object({
  shopname: z.string().min(1, 'Shop name is required').max(100).trim(),
  shopaddress: z.string().max(300).trim(),
  shopphone: z.string().max(30).trim(),
  invoicefooter: z.string().max(300).trim(),
  taxenabled: z.boolean(),
  taxrate: z.number().min(0).max(100)
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopname: '',
      shopaddress: '',
      shopphone: '',
      invoicefooter: '',
      taxenabled: false,
      taxrate: 0
    }
  })

  // Pre-fill form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        shopname: settings.shopname ?? '',
        shopaddress: settings.shopaddress ?? '',
        shopphone: settings.shopphone ?? '',
        invoicefooter: settings.invoicefooter ?? '',
        taxenabled: settings.taxenabled ?? false,
        taxrate: settings.taxrate ?? 0
      })
    }
  }, [settings, form])

  const onSubmit = async (data: SettingsFormValues) => {
    await updateSettings.mutateAsync(data)
  }

  const watchTaxEnabled = form.watch('taxenabled')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: '#0F5469' }}
        />
        <span className="ml-2 text-sm" style={{ color: '#64748B' }}>
          Loading settings...
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <Settings className="h-6 w-6" style={{ color: '#0F5469' }} /> Shop
            Settings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            These details appear on every printed invoice
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Shop Info */}
        <div
          className="bg-white rounded-lg border p-6 mb-4"
          style={{ borderColor: '#E2E8F0' }}
        >
          <h3 className="font-semibold mb-4" style={{ color: '#1E293B' }}>
            Shop Information
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label style={{ color: '#64748B' }}>Shop Name *</Label>
              <Input
                placeholder="Al-Rehman Motorcycles Parts"
                {...form.register('shopname')}
                style={{
                  borderColor: form.formState.errors.shopname
                    ? '#DC2626'
                    : '#E2E8F0'
                }}
              />
              {form.formState.errors.shopname && (
                <p className="text-xs" style={{ color: '#DC2626' }}>
                  {form.formState.errors.shopname.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label style={{ color: '#64748B' }}>Address</Label>
              <Textarea
                placeholder="Main Bazar, Sargodha, Punjab, Pakistan"
                rows={2}
                {...form.register('shopaddress')}
                style={{ borderColor: '#E2E8F0', resize: 'none' }}
              />
            </div>

            <div className="space-y-1.5">
              <Label style={{ color: '#64748B' }}>Phone Number</Label>
              <Input
                placeholder="048-XXXXXXX"
                {...form.register('shopphone')}
                style={{ borderColor: '#E2E8F0' }}
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div
          className="bg-white rounded-lg border p-6 mb-4"
          style={{ borderColor: '#E2E8F0' }}
        >
          <h3 className="font-semibold mb-4" style={{ color: '#1E293B' }}>
            Invoice Settings
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label style={{ color: '#64748B' }}>Invoice Footer Message</Label>
              <Textarea
                placeholder="Thank you for your business! All sales are final."
                rows={2}
                {...form.register('invoicefooter')}
                style={{ borderColor: '#E2E8F0', resize: 'none' }}
              />
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                Appears at the bottom of every printed invoice
              </p>
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div
          className="bg-white rounded-lg border p-6 mb-6"
          style={{ borderColor: '#E2E8F0' }}
        >
          <h3 className="font-semibold mb-4" style={{ color: '#1E293B' }}>
            Tax Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="taxEnabled"
                {...form.register('taxenabled')}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: '#0F5469' }}
              />
              <Label
                htmlFor="taxEnabled"
                className="cursor-pointer"
                style={{ color: '#1E293B' }}
              >
                Enable tax on invoices
              </Label>
            </div>

            {watchTaxEnabled && (
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>Tax Rate (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    {...form.register('taxrate', { valueAsNumber: true })}
                    className="w-28 text-center font-numeric"
                    style={{ borderColor: '#E2E8F0' }}
                  />
                  <span className="text-sm" style={{ color: '#64748B' }}>
                    %
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          disabled={updateSettings.isPending}
          className="w-full py-3 text-white font-bold text-sm"
          style={{ backgroundColor: '#0F5469' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#1A7A96')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#0F5469')
          }
        >
          {updateSettings.isPending ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <Save className="h-4 w-4" /> Save Settings
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}

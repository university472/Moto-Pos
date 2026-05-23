// frontend/src/app/(admin)/products/new/page.tsx

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Package, ArrowLeft, Loader2 } from 'lucide-react'

import { useCreateProduct } from '@/hooks/useProducts'
import { useBrands } from '@/hooks/useBrands'
import { useCategories } from '@/hooks/useCategories'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const productSchema = z.object({
  name: z.string().min(2, 'Min 2 characters').max(150).trim(),

  sku: z.string().max(50).trim().optional(),

  brand: z.string().min(1, 'Select a brand'),

  category: z.string().min(1, 'Select a category'),

  description: z.string().max(500).trim().optional(),

  purchasePrice: z.number().min(0, 'Enter valid purchase price'),

  salePrice: z.number().min(0, 'Enter valid sale price'),

  stockQty: z.number().int().min(0, 'Enter valid stock quantity'),

  lowStockThreshold: z.number().int().min(0, 'Enter valid threshold')
})

type ProductFormValues = z.infer<typeof productSchema>

export default function NewProductPage() {
  const router = useRouter()

  const createProduct = useCreateProduct()

  const { data: brandsData } = useBrands()

  const { data: categoriesData } = useCategories()

  const brands = brandsData?.brands ?? []

  const categories = categoriesData?.categories ?? []

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),

    defaultValues: {
      name: '',
      sku: '',
      brand: '',
      category: '',
      description: '',
      purchasePrice: 0,
      salePrice: 0,
      stockQty: 0,
      lowStockThreshold: 5
    }
  })

  const watchPurchasePrice = form.watch('purchasePrice')

  const watchSalePrice = form.watch('salePrice')

  const margin =
    watchPurchasePrice > 0
      ? Math.round(
          ((watchSalePrice - watchPurchasePrice) / watchPurchasePrice) * 100
        )
      : 0

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    await createProduct.mutateAsync(data)

    router.push('/products')
  }

  const FormField = ({
    label,
    error,
    required,
    children
  }: {
    label: string
    error?: string
    required?: boolean
    children: React.ReactNode
  }) => (
    <div className="space-y-1.5">
      <Label
        style={{
          color: '#64748B'
        }}
      >
        {label}{' '}
        {required && (
          <span
            style={{
              color: '#DC2626'
            }}
          >
            *
          </span>
        )}
      </Label>

      {children}

      {error && (
        <p
          className="text-xs"
          style={{
            color: '#DC2626'
          }}
        >
          {error}
        </p>
      )}
    </div>
  )

  return (
    <div className="max-w-3xl">
      <div className="page-header">
        <div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm mb-1"
            style={{
              color: '#64748B'
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Products
          </Link>

          <h1 className="flex items-center gap-2">
            <Package
              className="h-6 w-6"
              style={{
                color: '#0F5469'
              }}
            />
            Add New Product
          </h1>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {/* Basic Info */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{
              borderColor: '#E2E8F0'
            }}
          >
            <h3
              className="font-semibold mb-4"
              style={{
                color: '#1E293B'
              }}
            >
              Basic Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormField
                  label="Product Name"
                  required
                  error={form.formState.errors.name?.message}
                >
                  <Input
                    title="Product name"
                    aria-label="Product name"
                    placeholder="e.g. Honda 125 Air Filter"
                    autoFocus
                    {...form.register('name')}
                    style={{
                      borderColor: form.formState.errors.name
                        ? '#DC2626'
                        : '#E2E8F0'
                    }}
                  />
                </FormField>
              </div>

              <FormField label="SKU" error={form.formState.errors.sku?.message}>
                <Input
                  title="SKU"
                  aria-label="SKU"
                  placeholder="Auto-generated if empty"
                  {...form.register('sku')}
                  style={{
                    borderColor: '#E2E8F0'
                  }}
                />
              </FormField>

              <FormField
                label="Brand"
                required
                error={form.formState.errors.brand?.message}
              >
                <select
                  title="Select brand"
                  aria-label="Select brand"
                  {...form.register('brand')}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border outline-none"
                  style={{
                    borderColor: form.formState.errors.brand
                      ? '#DC2626'
                      : '#E2E8F0',
                    color: '#1E293B'
                  }}
                >
                  <option value="">Select brand...</option>

                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Category"
                required
                error={form.formState.errors.category?.message}
              >
                <select
                  title="Select category"
                  aria-label="Select category"
                  {...form.register('category')}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border outline-none"
                  style={{
                    borderColor: form.formState.errors.category
                      ? '#DC2626'
                      : '#E2E8F0',
                    color: '#1E293B'
                  }}
                >
                  <option value="">Select category...</option>

                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="col-span-2">
                <FormField label="Description">
                  <Textarea
                    title="Description"
                    aria-label="Description"
                    placeholder="Optional product description"
                    rows={2}
                    {...form.register('description')}
                    style={{
                      borderColor: '#E2E8F0',
                      resize: 'none'
                    }}
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{
              borderColor: '#E2E8F0'
            }}
          >
            <h3
              className="font-semibold mb-4"
              style={{
                color: '#1E293B'
              }}
            >
              Pricing & Stock
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Purchase Price (PKR)"
                required
                error={form.formState.errors.purchasePrice?.message}
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  {...form.register('purchasePrice', {
                    valueAsNumber: true
                  })}
                />
              </FormField>

              <FormField
                label="Sale Price (PKR)"
                required
                error={form.formState.errors.salePrice?.message}
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  {...form.register('salePrice', {
                    valueAsNumber: true
                  })}
                />

                {watchPurchasePrice > 0 && (
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: margin >= 0 ? '#16A34A' : '#DC2626'
                    }}
                  >
                    Margin: {margin >= 0 ? '+' : ''}
                    {margin}%
                  </p>
                )}
              </FormField>

              <FormField
                label="Opening Stock Qty"
                required
                error={form.formState.errors.stockQty?.message}
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  {...form.register('stockQty', {
                    valueAsNumber: true
                  })}
                />
              </FormField>

              <FormField
                label="Low Stock Threshold"
                error={form.formState.errors.lowStockThreshold?.message}
              >
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="5"
                  {...form.register('lowStockThreshold', {
                    valueAsNumber: true
                  })}
                />
              </FormField>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/products">
              <Button type="button" variant="outline" className="px-6">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={createProduct.isPending}
              className="flex-1 text-white font-bold"
              style={{
                backgroundColor: '#0F5469'
              }}
            >
              {createProduct.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

// frontend/src/app/(admin)/products/[id]/edit/page.tsx
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, ArrowLeft, Loader2 } from 'lucide-react'
import { useProductDetail, useUpdateProduct } from '@/hooks/useProducts'
import { useBrands } from '@/hooks/useBrands'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const editSchema = z.object({
  name: z.string().min(2).max(150).trim(),

  sku: z.string().max(50).trim().optional(),

  brand: z.string().min(1, 'Select a brand'),

  category: z.string().min(1, 'Select a category'),

  description: z.string().max(500).trim().optional(),

  purchasePrice: z.number().min(0, 'Enter a valid price'),

  salePrice: z.number().min(0, 'Enter a valid price'),

  stockQty: z.number().int().min(0, 'Enter a valid number'),

  lowStockThreshold: z.number().int().min(0)
})
type EditFormValues = z.infer<typeof editSchema>

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { data: product, isLoading: productLoading } =
    useProductDetail(productId)
  const { data: brandsData } = useBrands()
  const { data: categoriesData } = useCategories()
  const updateProduct = useUpdateProduct()

  const brands = brandsData?.brands ?? []
  const categories = categoriesData?.categories ?? []

  const form = useForm<EditFormValues>({ resolver: zodResolver(editSchema) })

  // Pre-fill form when product loads
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        brand:
          typeof product.brand === 'object'
            ? product.brand._id
            : (product.brand as string),
        category:
          typeof product.category === 'object'
            ? product.category._id
            : (product.category as string),
        description: product.description ?? '',
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        stockQty: product.stockQty,
        lowStockThreshold: product.lowStockThreshold
      })
    }
  }, [product, form])

  const watchPurchasePrice = form.watch('purchasePrice')
  const watchSalePrice = form.watch('salePrice')
  const margin =
    watchPurchasePrice > 0
      ? Math.round(
          ((watchSalePrice - watchPurchasePrice) / watchPurchasePrice) * 100
        )
      : 0

  const onSubmit = async (data: EditFormValues) => {
    await updateProduct.mutateAsync({ id: productId, data })
    router.push('/products')
  }

  if (productLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: '#0F5469' }}
        />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-32">
        <p className="text-sm" style={{ color: '#DC2626' }}>
          Product not found.
        </p>
        <Link
          href="/products"
          className="text-sm font-medium mt-2"
          style={{ color: '#0F5469' }}
        >
          Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="page-header">
        <div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm mb-1"
            style={{ color: '#64748B' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
          </Link>
          <h1 className="flex items-center gap-2">
            <Package className="h-6 w-6" style={{ color: '#0F5469' }} />
            Edit: {product.name}
          </h1>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: '#E2E8F0' }}
          >
            <h3 className="font-semibold mb-4" style={{ color: '#1E293B' }}>
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label style={{ color: '#64748B' }}>Product Name *</Label>
                <Input
                  {...form.register('name')}
                  style={{
                    borderColor: form.formState.errors.name
                      ? '#DC2626'
                      : '#E2E8F0'
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>SKU</Label>
                <Input
                  {...form.register('sku')}
                  style={{ borderColor: '#E2E8F0' }}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>Brand *</Label>
                <select
                  {...form.register('brand')}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border outline-none"
                  style={{ borderColor: '#E2E8F0', color: '#1E293B' }}
                >
                  <option value="">Select brand...</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>Category *</Label>
                <select
                  {...form.register('category')}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border outline-none"
                  style={{ borderColor: '#E2E8F0', color: '#1E293B' }}
                >
                  <option value="">Select category...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label style={{ color: '#64748B' }}>Description</Label>
                <Textarea
                  rows={2}
                  {...form.register('description')}
                  style={{ borderColor: '#E2E8F0', resize: 'none' }}
                />
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: '#E2E8F0' }}
          >
            <h3 className="font-semibold mb-4" style={{ color: '#1E293B' }}>
              Pricing & Stock
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>
                  Purchase Price (PKR) *
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...form.register('purchasePrice', { valueAsNumber: true })}
                  className="font-numeric"
                  style={{ borderColor: '#E2E8F0' }}
                />
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>Sale Price (PKR) *</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...form.register('salePrice', { valueAsNumber: true })}
                  className="font-numeric"
                  style={{ borderColor: '#E2E8F0' }}
                />
                {watchPurchasePrice > 0 && (
                  <p
                    className="text-xs font-medium"
                    style={{ color: margin >= 0 ? '#16A34A' : '#DC2626' }}
                  >
                    Margin: {margin >= 0 ? '+' : ''}
                    {margin}%
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>Stock Quantity *</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...form.register('stockQty', { valueAsNumber: true })}
                  className="font-numeric"
                  style={{ borderColor: '#E2E8F0' }}
                />
                <p className="text-xs" style={{ color: '#94A3B8' }}>
                  Use Purchase Entry to add stock. Edit only for corrections.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label style={{ color: '#64748B' }}>Low Stock Threshold</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  {...form.register('lowStockThreshold', {
                    valueAsNumber: true
                  })}
                  className="font-numeric"
                  style={{ borderColor: '#E2E8F0' }}
                />
              </div>
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
              disabled={updateProduct.isPending}
              className="flex-1 text-white font-bold"
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
              {updateProduct.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

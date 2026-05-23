// frontend/src/app/(admin)/products/[id]/page.tsx
// Product detail view — full info including stock history summary.

'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Pencil,
  Package,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { useProductDetail } from '@/hooks/useProducts'
import { formatPKR, formatDateTime } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: product, isLoading } = useProductDetail(id as string)

  if (isLoading) {
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
        <button
          onClick={() => router.push('/products')}
          className="text-sm font-medium mt-3 block mx-auto"
          style={{ color: '#0F5469' }}
        >
          Back to Products
        </button>
      </div>
    )
  }

  const isLow =
    product.stockQty <= product.lowStockThreshold && product.stockQty > 0
  const isOut = product.stockQty === 0
  const margin =
    product.purchasePrice > 0
      ? Math.round(
          ((product.salePrice - product.purchasePrice) /
            product.purchasePrice) *
            100
        )
      : 0

  const brandName = typeof product.brand === 'object' ? product.brand.name : '—'
  const categoryName =
    typeof product.category === 'object' ? product.category.name : '—'

  return (
    <div className="max-w-3xl">
      {/* Header */}
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
            {product.name}
          </h1>
        </div>
        <Link href={`/products/${id}/edit`}>
          <button
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white"
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
            <Pencil className="h-4 w-4" /> Edit Product
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main Info */}
        <div className="col-span-2 space-y-4">
          <div
            className="bg-white rounded-lg border p-5"
            style={{ borderColor: '#E2E8F0' }}
          >
            <h3 className="font-semibold mb-4" style={{ color: '#1E293B' }}>
              Product Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'SKU', value: product.sku, mono: true },
                { label: 'Brand', value: brandName },
                { label: 'Category', value: categoryName },
                {
                  label: 'Status',
                  value: product.isActive ? 'Active' : 'Inactive'
                }
              ].map(({ label, value, mono }) => (
                <div key={label}>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: '#94A3B8' }}
                  >
                    {label}
                  </p>
                  <p
                    className={mono ? 'font-mono' : 'font-medium'}
                    style={{ color: '#1E293B' }}
                  >
                    {value}
                  </p>
                </div>
              ))}
              {product.description && (
                <div className="col-span-2">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: '#94A3B8' }}
                  >
                    Description
                  </p>
                  <p style={{ color: '#64748B' }}>{product.description}</p>
                </div>
              )}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: '#94A3B8' }}
                >
                  Added On
                </p>
                <p style={{ color: '#64748B' }}>
                  {formatDateTime(product.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div
            className="bg-white rounded-lg border p-5"
            style={{ borderColor: '#E2E8F0' }}
          >
            <h3 className="font-semibold mb-4" style={{ color: '#1E293B' }}>
              Pricing
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: '#F8FAFC' }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: '#94A3B8' }}
                >
                  Purchase Price
                </p>
                <p
                  className="text-xl font-bold font-numeric"
                  style={{ color: '#1E293B' }}
                >
                  {formatPKR(product.purchasePrice)}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(15,84,105,0.05)' }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: '#94A3B8' }}
                >
                  Sale Price
                </p>
                <p
                  className="text-xl font-bold font-numeric"
                  style={{ color: '#0F5469' }}
                >
                  {formatPKR(product.salePrice)}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: margin >= 0 ? '#DCFCE7' : '#FEE2E2' }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: '#94A3B8' }}
                >
                  Profit Margin
                </p>
                <p
                  className="text-xl font-bold font-numeric"
                  style={{ color: margin >= 0 ? '#16A34A' : '#DC2626' }}
                >
                  {margin >= 0 ? '+' : ''}
                  {margin}%
                </p>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: '#94A3B8' }}>
              Profit per unit:{' '}
              {formatPKR(product.salePrice - product.purchasePrice)}
            </p>
          </div>
        </div>

        {/* Stock Sidebar */}
        <div className="col-span-1 space-y-4">
          <div
            className="bg-white rounded-lg border p-5"
            style={{ borderColor: '#E2E8F0' }}
          >
            <h3 className="font-semibold mb-4" style={{ color: '#1E293B' }}>
              Stock Status
            </h3>
            <div className="text-center py-4">
              <p
                className="text-5xl font-black font-numeric mb-2"
                style={{
                  color: isOut ? '#DC2626' : isLow ? '#F59E0B' : '#16A34A'
                }}
              >
                {product.stockQty}
              </p>
              <p className="text-sm" style={{ color: '#64748B' }}>
                units in stock
              </p>
              <div className="mt-3">
                {isOut && <span className="badge-out-stock">Out of Stock</span>}
                {isLow && <span className="badge-low-stock">Low Stock</span>}
                {!isOut && !isLow && (
                  <span className="badge-in-stock">In Stock</span>
                )}
              </div>
            </div>
            <div
              className="border-t pt-4 mt-4"
              style={{ borderColor: '#F1F5F9' }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: '#64748B' }}>Low stock alert</span>
                <span
                  className="font-numeric font-semibold"
                  style={{ color: '#1E293B' }}
                >
                  ≤ {product.lowStockThreshold} units
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span style={{ color: '#64748B' }}>Stock value</span>
                <span
                  className="font-numeric font-semibold"
                  style={{ color: '#1E293B' }}
                >
                  {formatPKR(product.stockQty * product.purchasePrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <Link
              href="/purchases/new"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold w-full transition-colors"
              style={{
                backgroundColor: '#DCFCE7',
                color: '#166534',
                border: '1px solid #BBF7D0'
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  '#BBF7D0')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  '#DCFCE7')
              }
            >
              <TrendingUp className="h-4 w-4" /> Record Purchase (Add Stock)
            </Link>
            <Link
              href="/returns"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold w-full transition-colors"
              style={{
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A'
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  '#FDE68A')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                  '#FEF3C7')
              }
            >
              <TrendingDown className="h-4 w-4" /> Process Return
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

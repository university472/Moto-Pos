// frontend/src/app/(admin)/inventory/low-stock/page.tsx
// Low stock alert page — all products at or below their threshold.
// Linked from sidebar badge and dashboard widget.

'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, Loader2, Package } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { ApiResponse } from '@/types/api'
import { formatPKR } from '@/lib/utils'

interface LowStockProduct {
  _id: string
  name: string
  sku: string
  stockQty: number
  lowStockThreshold: number
  salePrice: number
  purchasePrice: number
  brand: { _id: string; name: string }
  category: { _id: string; name: string }
}

function useLowStockProducts() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      const res = await api.get<
        ApiResponse<{ products: LowStockProduct[]; count: number }>
      >('/inventory/low-stock')
      return res.data.data
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000
  })
}

export default function LowStockPage() {
  const { data, isLoading } = useLowStockProducts()
  const products = data?.products ?? []
  const count = data?.count ?? 0

  return (
    <div>
      <div className="page-header">
        <div>
          <Link
            href="/inventory"
            className="flex items-center gap-1 text-sm mb-1"
            style={{ color: '#64748B' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Inventory
          </Link>
          <h1 className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" style={{ color: '#F59E0B' }} />
            Low Stock Alerts
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            {count} product{count !== 1 ? 's' : ''} at or below reorder
            threshold
          </p>
        </div>
        <Link
          href="/purchases/new"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: '#0F5469' }}
        >
          <Package className="h-4 w-4" /> Record Purchase
        </Link>
      </div>

      {/* Alert banner */}
      {count > 0 && (
        <div
          className="mb-4 p-4 rounded-lg flex items-start gap-3"
          style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}
        >
          <AlertTriangle
            className="h-5 w-5 flex-shrink-0 mt-0.5"
            style={{ color: '#F59E0B' }}
          />
          <div>
            <p className="font-semibold text-sm" style={{ color: '#92400E' }}>
              {count} product{count !== 1 ? 's need' : ' needs'} restocking
            </p>
            <p className="text-sm mt-0.5" style={{ color: '#92400E' }}>
              Record a purchase entry to increase stock levels and dismiss these
              alerts.
            </p>
          </div>
        </div>
      )}

      <div
        className="bg-white rounded-lg border overflow-hidden"
        style={{ borderColor: '#E2E8F0' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{ color: '#F59E0B' }}
            />
            <span className="ml-2 text-sm" style={{ color: '#64748B' }}>
              Checking stock levels...
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#DCFCE7' }}
            >
              <Package className="h-6 w-6" style={{ color: '#16A34A' }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: '#16A34A' }}>
              All stock levels are healthy!
            </p>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>
              No products are below their reorder threshold.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th className="text-center">Current Stock</th>
                <th className="text-center">Threshold</th>
                <th className="text-center">Shortage</th>
                <th className="text-right">Sale Price</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => {
                const isOut = product.stockQty === 0
                const shortage = product.lowStockThreshold - product.stockQty
                return (
                  <tr
                    key={product._id}
                    style={{ backgroundColor: isOut ? '#FFF5F5' : '#FFFBEB' }}
                  >
                    <td
                      className="text-sm font-numeric"
                      style={{ color: '#94A3B8' }}
                    >
                      {idx + 1}
                    </td>
                    <td>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: '#1E293B' }}
                      >
                        {product.name}
                      </p>
                      <p
                        className="font-mono text-xs"
                        style={{ color: '#94A3B8' }}
                      >
                        {product.sku}
                      </p>
                    </td>
                    <td className="text-sm" style={{ color: '#64748B' }}>
                      {typeof product.brand === 'object'
                        ? product.brand.name
                        : '—'}
                    </td>
                    <td className="text-sm" style={{ color: '#64748B' }}>
                      {typeof product.category === 'object'
                        ? product.category.name
                        : '—'}
                    </td>
                    <td className="text-center">
                      <span
                        className="font-numeric font-bold text-lg"
                        style={{ color: isOut ? '#DC2626' : '#F59E0B' }}
                      >
                        {product.stockQty}
                      </span>
                    </td>
                    <td
                      className="text-center font-numeric text-sm"
                      style={{ color: '#64748B' }}
                    >
                      {product.lowStockThreshold}
                    </td>
                    <td className="text-center">
                      <span
                        className="font-numeric text-sm font-semibold"
                        style={{ color: '#DC2626' }}
                      >
                        {shortage > 0 ? `+${shortage} needed` : 'Out'}
                      </span>
                    </td>
                    <td
                      className="text-right font-numeric text-sm font-semibold"
                      style={{ color: '#1E293B' }}
                    >
                      {formatPKR(product.salePrice)}
                    </td>
                    <td className="text-center">
                      {isOut ? (
                        <span className="badge-out-stock">Out of Stock</span>
                      ) : (
                        <span className="badge-low-stock">Low Stock</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

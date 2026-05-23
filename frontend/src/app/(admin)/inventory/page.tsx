// frontend/src/app/(admin)/inventory/page.tsx
// Full inventory overview — all active products with stock levels, color-coded.

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Package,
  Search
} from 'lucide-react'
import api from '@/lib/api'
import { ApiResponse } from '@/types/api'
import { formatPKR } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface InventorySummary {
  totalProducts: number
  totalStockUnits: number
  totalStockValue: number
  totalSaleValue: number
  outOfStockCount: number
  lowStockCount: number
}

interface InventoryProduct {
  _id: string
  name: string
  sku: string
  stockQty: number
  lowStockThreshold: number
  purchasePrice: number
  salePrice: number
  brand: { _id: string; name: string }
  category: { _id: string; name: string }
}

function useInventorySummary() {
  return useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: async () => {
      const res =
        await api.get<ApiResponse<{ summary: InventorySummary }>>(
          '/inventory/summary'
        )
      return res.data.data.summary
    },
    staleTime: 60 * 1000
  })
}

function useAllProducts() {
  return useQuery({
    queryKey: ['products', 'inventory-overview'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ products: InventoryProduct[] }>>(
        '/products?limit=500&sort=stock'
      )
      return res.data.data.products
    },
    staleTime: 30 * 1000
  })
}

export default function InventoryPage() {
  const { data: summary, isLoading: summaryLoading } = useInventorySummary()
  const { data: products = [], isLoading: productsLoading } = useAllProducts()
  const [searchFilter, setSearchFilter] = useState('')

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const getStockStatus = (p: InventoryProduct) => {
    if (p.stockQty === 0) return 'out'
    if (p.stockQty <= p.lowStockThreshold) return 'low'
    return 'ok'
  }

  const statCards = [
    {
      label: 'Total Products',
      value: summary?.totalProducts ?? 0,
      icon: Package,
      format: 'number',
      color: '#0F5469',
      bg: 'rgba(15,84,105,0.08)'
    },
    {
      label: 'Stock Value (Cost)',
      value: summary?.totalStockValue ?? 0,
      icon: TrendingUp,
      format: 'currency',
      color: '#16A34A',
      bg: '#DCFCE7'
    },
    {
      label: 'Low Stock Items',
      value: summary?.lowStockCount ?? 0,
      icon: AlertTriangle,
      format: 'number',
      color: '#F59E0B',
      bg: '#FEF3C7'
    },
    {
      label: 'Out of Stock',
      value: summary?.outOfStockCount ?? 0,
      icon: ShoppingBag,
      format: 'number',
      color: '#DC2626',
      bg: '#FEE2E2'
    }
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" style={{ color: '#0F5469' }} />{' '}
            Inventory Overview
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            Stock levels for all active products
          </p>
        </div>
        <Link
          href="/inventory/low-stock"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg"
          style={{
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #F59E0B'
          }}
        >
          <AlertTriangle className="h-4 w-4" />
          View Low Stock ({summary?.lowStockCount ?? 0})
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="stat-card flex items-start gap-3">
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: card.bg }}
              >
                <Icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#64748B' }}
                >
                  {card.label}
                </p>
                {summaryLoading ? (
                  <div
                    className="h-6 w-20 rounded animate-pulse mt-1"
                    style={{ backgroundColor: '#E2E8F0' }}
                  />
                ) : (
                  <p
                    className="text-xl font-bold font-numeric mt-0.5"
                    style={{ color: '#1E293B' }}
                  >
                    {card.format === 'currency'
                      ? formatPKR(card.value)
                      : card.value.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: '#94A3B8' }}
          />
          <Input
            placeholder="Filter by name or SKU..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-9"
            style={{ borderColor: '#E2E8F0' }}
          />
        </div>
        <p className="text-sm" style={{ color: '#64748B' }}>
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Products Table */}
      <div
        className="bg-white rounded-lg border overflow-hidden"
        style={{ borderColor: '#E2E8F0' }}
      >
        {productsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: '#0F5469' }}
            />
            <span className="ml-2 text-sm" style={{ color: '#64748B' }}>
              Loading inventory...
            </span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th className="text-center">Stock Qty</th>
                <th className="text-center">Threshold</th>
                <th className="text-right">Cost Price</th>
                <th className="text-right">Sale Price</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const status = getStockStatus(product)
                return (
                  <tr
                    key={product._id}
                    style={{
                      backgroundColor:
                        status === 'out'
                          ? '#FFF5F5'
                          : status === 'low'
                            ? '#FFFBEB'
                            : 'transparent'
                    }}
                  >
                    <td>
                      <p
                        className="font-medium text-sm"
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
                        style={{
                          color:
                            status === 'out'
                              ? '#DC2626'
                              : status === 'low'
                                ? '#F59E0B'
                                : '#16A34A'
                        }}
                      >
                        {product.stockQty}
                      </span>
                    </td>
                    <td
                      className="text-center text-sm font-numeric"
                      style={{ color: '#64748B' }}
                    >
                      {product.lowStockThreshold}
                    </td>
                    <td
                      className="text-right font-numeric text-sm"
                      style={{ color: '#64748B' }}
                    >
                      {formatPKR(product.purchasePrice)}
                    </td>
                    <td
                      className="text-right font-numeric text-sm font-semibold"
                      style={{ color: '#1E293B' }}
                    >
                      {formatPKR(product.salePrice)}
                    </td>
                    <td className="text-center">
                      {status === 'out' && (
                        <span className="badge-out-stock">Out of Stock</span>
                      )}
                      {status === 'low' && (
                        <span className="badge-low-stock">Low Stock</span>
                      )}
                      {status === 'ok' && (
                        <span className="badge-in-stock">In Stock</span>
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

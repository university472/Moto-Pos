// frontend/src/components/admin/LowStockAlert.tsx
// Dashboard widget showing low-stock items. Clickable → /inventory/low-stock.

'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { ApiResponse } from '@/types/api'

interface LowStockItem {
  _id: string
  name: string
  sku: string
  stockQty: number
  lowStockThreshold: number
}

export function LowStockAlert() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'low-stock-widget'],
    queryFn: async () => {
      const res = await api.get<
        ApiResponse<{ products: LowStockItem[]; count: number }>
      >('/inventory/low-stock')
      return res.data.data
    },
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })

  const items = data?.products?.slice(0, 6) ?? []
  const count = data?.count ?? 0

  return (
    <div
      className="bg-white rounded-lg border h-full"
      style={{ borderColor: '#E2E8F0' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" style={{ color: '#F59E0B' }} />
          <h3 className="font-semibold text-sm" style={{ color: '#1E293B' }}>
            Low Stock Alerts
          </h3>
          {count > 0 && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
            >
              {count}
            </span>
          )}
        </div>
        <Link
          href="/inventory/low-stock"
          className="text-xs font-medium flex items-center gap-1 transition-colors"
          style={{ color: '#0F5469' }}
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="p-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 rounded animate-pulse"
                style={{ backgroundColor: '#F1F5F9' }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm font-medium" style={{ color: '#16A34A' }}>
              ✓ All stock healthy
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => {
              const isOut = item.stockQty === 0
              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ backgroundColor: isOut ? '#FFF5F5' : '#FFFBEB' }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: '#1E293B' }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="text-xs font-mono"
                      style={{ color: '#94A3B8' }}
                    >
                      {item.sku}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span
                      className="text-sm font-bold font-numeric"
                      style={{ color: isOut ? '#DC2626' : '#F59E0B' }}
                    >
                      {item.stockQty}
                    </span>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>
                      /{item.lowStockThreshold}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

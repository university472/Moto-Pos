// frontend/src/components/admin/TopProducts.tsx
'use client'

import { TrendingUp } from 'lucide-react'
import { useTopProductsToday } from '@/hooks/useDashboard'
import { formatPKR } from '@/lib/utils'

export function TopProducts() {
  const { data: topProducts = [], isLoading } = useTopProductsToday()

  return (
    <div
      className="bg-white rounded-lg border"
      style={{ borderColor: '#E2E8F0' }}
    >
      <div
        className="flex items-center gap-2 px-5 py-4 border-b"
        style={{ borderColor: '#E2E8F0' }}
      >
        <TrendingUp className="h-4 w-4" style={{ color: '#0F5469' }} />
        <h3 className="font-semibold text-sm" style={{ color: '#1E293B' }}>
          Top Products Today
        </h3>
      </div>
      <div className="p-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-9 rounded animate-pulse"
                style={{ backgroundColor: '#F1F5F9' }}
              />
            ))}
          </div>
        ) : topProducts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              No sales recorded today
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {topProducts.map((product, idx) => (
              <div
                key={product._id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor:
                    idx === 0 ? 'rgba(15,84,105,0.04)' : 'transparent'
                }}
              >
                <span
                  className="text-xs font-bold w-5 text-center font-numeric"
                  style={{ color: idx === 0 ? '#0F5469' : '#94A3B8' }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: '#1E293B' }}
                  >
                    {product.productName}
                  </p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>
                    {product.totalQty} units sold
                  </p>
                </div>
                <p
                  className="text-xs font-semibold font-numeric flex-shrink-0"
                  style={{ color: '#16A34A' }}
                >
                  {formatPKR(product.totalRevenue)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

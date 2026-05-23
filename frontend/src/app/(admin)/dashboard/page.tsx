// frontend/src/app/(admin)/dashboard/page.tsx — Full implementation
'use client'

import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Package,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'
import { StatsCard } from '@/components/admin/StatsCard'
import { SalesChart } from '@/components/admin/SalesChart'
import { LowStockAlert } from '@/components/admin/LowStockAlert'
import { TopProducts } from '@/components/admin/TopProducts'
import { useDashboardStats } from '@/hooks/useDashboard'
import { formatPKR, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const [chartDays, setChartDays] = useState(7)

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" style={{ color: '#0F5469' }} />
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            {formatDate(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#64748B' }}>
            Auto-refreshes every 2 min
          </span>
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#16A34A' }}
          />
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Today's Revenue"
          value={isLoading ? '—' : formatPKR(stats?.todayRevenue ?? 0)}
          icon={DollarSign}
          iconColor="#0F5469"
          iconBg="rgba(15,84,105,0.1)"
          isLoading={isLoading}
        />
        <StatsCard
          label="Transactions Today"
          value={isLoading ? '—' : (stats?.todayTransactions ?? 0).toString()}
          icon={ShoppingCart}
          iconColor="#16A34A"
          iconBg="#DCFCE7"
          isLoading={isLoading}
        />
        <StatsCard
          label="Low Stock Items"
          value={isLoading ? '—' : (stats?.lowStockCount ?? 0).toString()}
          icon={AlertTriangle}
          iconColor="#F59E0B"
          iconBg="#FEF3C7"
          isLoading={isLoading}
        />
        <StatsCard
          label="Total Stock Value"
          value={isLoading ? '—' : formatPKR(stats?.totalStockValue ?? 0)}
          icon={Package}
          iconColor="#8B5CF6"
          iconBg="rgba(139,92,246,0.1)"
          isLoading={isLoading}
        />
      </div>

      {/* Chart + Low Stock Row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Bar Chart */}
        <div
          className="col-span-2 bg-white rounded-lg border p-5"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: '#1E293B' }}>
              Sales Revenue
            </h3>
            <div className="flex gap-1">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
                  style={{
                    backgroundColor: chartDays === d ? '#0F5469' : '#F8FAFC',
                    color: chartDays === d ? '#FFFFFF' : '#64748B',
                    border: `1px solid ${chartDays === d ? '#0F5469' : '#E2E8F0'}`
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <SalesChart days={chartDays} />
        </div>

        {/* Low Stock Alert */}
        <div className="col-span-1">
          <LowStockAlert />
        </div>
      </div>

      {/* Top Products Row */}
      <div className="grid grid-cols-2 gap-4">
        <TopProducts />

        {/* Quick Stats */}
        <div
          className="bg-white rounded-lg border p-5"
          style={{ borderColor: '#E2E8F0' }}
        >
          <h3
            className="font-semibold text-sm mb-4"
            style={{ color: '#1E293B' }}
          >
            Today&apos;s Summary
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-6 rounded animate-pulse"
                  style={{ backgroundColor: '#F1F5F9' }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                {
                  label: 'Gross Revenue',
                  value: formatPKR(stats?.todayRevenue ?? 0),
                  color: '#1E293B'
                },
                {
                  label: 'Total Discounts Given',
                  value: formatPKR(stats?.todayDiscount ?? 0),
                  color: '#F59E0B'
                },
                {
                  label: 'Net Revenue',
                  value: formatPKR(
                    (stats?.todayRevenue ?? 0) - (stats?.todayDiscount ?? 0)
                  ),
                  color: '#16A34A'
                },
                {
                  label: 'Out of Stock Products',
                  value: (stats?.outOfStockCount ?? 0).toString(),
                  color: '#DC2626'
                }
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                  style={{ borderColor: '#F1F5F9' }}
                >
                  <span className="text-sm" style={{ color: '#64748B' }}>
                    {item.label}
                  </span>
                  <span
                    className="font-semibold font-numeric text-sm"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

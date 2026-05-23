// frontend/src/app/(admin)/reports/profit/page.tsx

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, Loader2 } from 'lucide-react'

import api from '@/lib/api'
import { ApiResponse } from '@/types/api'
import { formatPKR } from '@/lib/utils'

interface ProfitItem {
  _id: string
  productName: string
  productSku: string
  totalQtySold: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMarginPct: number
}

interface ProfitData {
  profitData: ProfitItem[]

  overall: {
    totalRevenue: number
    totalCost: number
    totalProfit: number
    overallMarginPct: number
  }

  period: {
    start: Date
    end: Date
  }
}

export default function ProfitReportPage() {
  const now = new Date()

  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]

  const [startDate, setStartDate] = useState<string>(firstOfMonth)

  const [endDate, setEndDate] = useState<string>(
    now.toISOString().split('T')[0]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'profit', startDate, endDate],

    queryFn: async (): Promise<ProfitData> => {
      const res = await api.get<ApiResponse<ProfitData>>(
        `/reports/profit?start=${startDate}&end=${endDate}`
      )

      return res.data.data
    }
  })

  const items = data?.profitData ?? []

  const overall = data?.overall

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6" style={{ color: '#0F5469' }} />
            Profit / Loss Report
          </h1>
        </div>

        {/* Filters */}
        <div className="flex items-end gap-3">
          {/* Start Date */}
          <div className="flex flex-col">
            <label
              htmlFor="start-date"
              className="text-xs font-medium mb-1"
              style={{ color: '#64748B' }}
            >
              Start Date
            </label>

            <input
              id="start-date"
              type="date"
              value={startDate}
              aria-label="Select start date"
              title="Select start date"
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border outline-none w-40"
              style={{
                borderColor: '#E2E8F0',
                color: '#1E293B'
              }}
            />
          </div>

          {/* Separator */}
          <div className="text-sm pb-2" style={{ color: '#94A3B8' }}>
            to
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label
              htmlFor="end-date"
              className="text-xs font-medium mb-1"
              style={{ color: '#64748B' }}
            >
              End Date
            </label>

            <input
              id="end-date"
              type="date"
              value={endDate}
              aria-label="Select end date"
              title="Select end date"
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border outline-none w-40"
              style={{
                borderColor: '#E2E8F0',
                color: '#1E293B'
              }}
            />
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      {overall && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Revenue',
              value: formatPKR(overall.totalRevenue),
              color: '#0F5469'
            },
            {
              label: 'Total Cost',
              value: formatPKR(overall.totalCost),
              color: '#64748B'
            },
            {
              label: 'Net Profit',
              value: formatPKR(overall.totalProfit),
              color: overall.totalProfit >= 0 ? '#16A34A' : '#DC2626'
            },
            {
              label: 'Overall Margin',
              value: `${overall.overallMarginPct}%`,
              color: overall.overallMarginPct >= 0 ? '#16A34A' : '#DC2626'
            }
          ].map((card) => (
            <div key={card.label} className="stat-card">
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: '#64748B' }}
              >
                {card.label}
              </p>

              <p
                className="text-xl font-bold font-numeric"
                style={{ color: card.color }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: '#0F5469' }}
          />

          <span className="ml-2 text-sm" style={{ color: '#64748B' }}>
            Calculating profit...
          </span>
        </div>
      ) : (
        <div
          className="bg-white rounded-lg border overflow-hidden"
          style={{ borderColor: '#E2E8F0' }}
        >
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: '#94A3B8' }}>
                No sales data for selected period.
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th className="text-center">Qty Sold</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Cost</th>
                  <th className="text-right">Profit</th>
                  <th className="text-right">Margin %</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, idx) => (
                  <tr key={item._id}>
                    <td
                      className="text-sm font-numeric"
                      style={{ color: '#94A3B8' }}
                    >
                      {idx + 1}
                    </td>

                    <td>
                      <p
                        className="font-medium text-sm"
                        style={{ color: '#1E293B' }}
                      >
                        {item.productName}
                      </p>

                      <p
                        className="font-mono text-xs"
                        style={{ color: '#94A3B8' }}
                      >
                        {item.productSku}
                      </p>
                    </td>

                    <td
                      className="text-center font-numeric text-sm"
                      style={{ color: '#64748B' }}
                    >
                      {item.totalQtySold}
                    </td>

                    <td
                      className="text-right font-numeric text-sm font-semibold"
                      style={{ color: '#1E293B' }}
                    >
                      {formatPKR(item.totalRevenue)}
                    </td>

                    <td
                      className="text-right font-numeric text-sm"
                      style={{ color: '#64748B' }}
                    >
                      {formatPKR(item.totalCost)}
                    </td>

                    <td
                      className="text-right font-numeric text-sm font-semibold"
                      style={{
                        color: item.totalProfit >= 0 ? '#16A34A' : '#DC2626'
                      }}
                    >
                      {item.totalProfit >= 0 ? '+' : ''}
                      {formatPKR(item.totalProfit)}
                    </td>

                    <td className="text-right">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full font-numeric"
                        style={{
                          backgroundColor:
                            item.profitMarginPct >= 20
                              ? '#DCFCE7'
                              : item.profitMarginPct >= 10
                                ? '#FEF3C7'
                                : '#FEE2E2',

                          color:
                            item.profitMarginPct >= 20
                              ? '#16A34A'
                              : item.profitMarginPct >= 10
                                ? '#92400E'
                                : '#DC2626'
                        }}
                      >
                        {item.profitMarginPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

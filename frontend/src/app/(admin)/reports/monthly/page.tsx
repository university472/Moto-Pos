// frontend/src/app/(admin)/reports/monthly/page.tsx

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, Loader2 } from 'lucide-react'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

import type {
  ValueType,
  NameType
} from 'recharts/types/component/DefaultTooltipContent'

import api from '@/lib/api'
import { ApiResponse } from '@/types/api'
import { formatPKR } from '@/lib/utils'

interface MonthlyData {
  year: number
  month: number

  summary: {
    totalRevenue: number
    totalTransactions: number
    totalDiscount: number
    avgSaleValue: number
  }

  dailyBreakdown: {
    day: number
    revenue: number
    transactions: number
  }[]
}

export default function MonthlyReportPage() {
  const now = new Date()

  const [year, setYear] = useState<number>(now.getFullYear())

  const [month, setMonth] = useState<number>(now.getMonth() + 1)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'monthly', year, month],

    queryFn: async (): Promise<MonthlyData> => {
      const res = await api.get<ApiResponse<MonthlyData>>(
        `/reports/monthly?year=${year}&month=${month}`
      )

      return res.data.data
    }
  })

  const summary = data?.summary

  const dailyBreakdown = data?.dailyBreakdown ?? []

  const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6" style={{ color: '#0F5469' }} />
            Monthly Report
          </h1>
        </div>

        {/* Filters */}
        <div className="flex items-end gap-3">
          {/* Month */}
          <div className="flex flex-col">
            <label
              htmlFor="month-select"
              className="text-xs font-medium mb-1"
              style={{ color: '#64748B' }}
            >
              Month
            </label>

            <select
              id="month-select"
              aria-label="Select month"
              title="Select month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="text-sm px-3 py-2 rounded-lg border outline-none"
              style={{
                borderColor: '#E2E8F0',
                color: '#1E293B'
              }}
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="flex flex-col">
            <label
              htmlFor="year-input"
              className="text-xs font-medium mb-1"
              style={{ color: '#64748B' }}
            >
              Year
            </label>

            <input
              id="year-input"
              aria-label="Enter year"
              title="Enter year"
              type="number"
              placeholder="Year"
              value={year}
              min={2020}
              max={now.getFullYear()}
              onChange={(e) => setYear(Number(e.target.value))}
              className="text-sm px-3 py-2 rounded-lg border outline-none w-24 text-center"
              style={{
                borderColor: '#E2E8F0',
                color: '#1E293B'
              }}
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: '#0F5469' }}
          />

          <span className="ml-2 text-sm" style={{ color: '#64748B' }}>
            Loading...
          </span>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'Total Revenue',
                value: formatPKR(summary?.totalRevenue ?? 0),
                color: '#0F5469'
              },

              {
                label: 'Transactions',
                value: summary?.totalTransactions ?? 0,
                color: '#16A34A'
              },

              {
                label: 'Total Discounts',
                value: formatPKR(summary?.totalDiscount ?? 0),
                color: '#F59E0B'
              },

              {
                label: 'Avg Sale Value',
                value: formatPKR(Math.round(summary?.avgSaleValue ?? 0)),
                color: '#8B5CF6'
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

          {/* Chart */}
          <div
            className="bg-white rounded-lg border p-5"
            style={{
              borderColor: '#E2E8F0'
            }}
          >
            <h3
              className="font-semibold text-sm mb-4"
              style={{ color: '#1E293B' }}
            >
              Daily Revenue — {MONTHS[month - 1]} {year}
            </h3>

            {dailyBreakdown.length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <p
                  className="text-sm"
                  style={{
                    color: '#94A3B8'
                  }}
                >
                  No sales data for this month
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={dailyBreakdown}
                  margin={{
                    top: 4,
                    right: 4,
                    left: 0,
                    bottom: 0
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F1F5F9"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 11,
                      fill: '#94A3B8'
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: '#94A3B8'
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number | string) =>
                      `${Math.round(Number(value) / 1000)}k`
                    }
                    width={36}
                  />

                  <Tooltip
                    formatter={(value?: ValueType, _name?: NameType) => [
                      formatPKR(Number(value ?? 0)),
                      'Revenue'
                    ]}
                    cursor={{
                      fill: 'rgba(15,84,105,0.05)'
                    }}
                  />

                  <Bar
                    dataKey="revenue"
                    fill="#0F5469"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  )
}

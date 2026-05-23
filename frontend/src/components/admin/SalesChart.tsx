// frontend/src/components/admin/SalesChart.tsx

'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import type { TooltipProps } from 'recharts'

import type {
  NameType,
  ValueType
} from 'recharts/types/component/DefaultTooltipContent'

import { useSalesChartData } from '@/hooks/useDashboard'

import { formatPKR } from '@/lib/utils'

// import './sales-chart.css'

/* ──────────────────────────────────────────────
   CUSTOM TOOLTIP
────────────────────────────────────────────── */

function CustomTooltip({
  active,
  payload,
  label
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const revenue = typeof payload[0]?.value === 'number' ? payload[0].value : 0

  const transactions =
    typeof payload[1]?.value === 'number' ? payload[1].value : null

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>

      <p className="chart-tooltip-value">{formatPKR(revenue)}</p>

      {transactions !== null && (
        <p className="chart-tooltip-transactions">
          {transactions} transactions
        </p>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */

interface SalesChartProps {
  days?: number
}

/* ──────────────────────────────────────────────
   COMPONENT
────────────────────────────────────────────── */

export function SalesChart({ days = 7 }: SalesChartProps) {
  const { data: chartData = [], isLoading } = useSalesChartData(days)

  const formattedData = chartData.map((item) => ({
    ...item,

    label: new Date(`${item.date}T00:00:00`).toLocaleDateString('en-PK', {
      weekday: 'short',
      day: 'numeric'
    })
  }))

  /* ──────────────────────────────────────────
     LOADING STATE
  ───────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="chart-loading">
        <div className="chart-spinner" />
      </div>
    )
  }

  /* ──────────────────────────────────────────
     EMPTY STATE
  ───────────────────────────────────────── */

  const hasData = chartData.some((item) => item.revenue > 0)

  if (!hasData) {
    return (
      <div className="chart-empty">
        <p className="chart-empty-text">No sales data for this period</p>
      </div>
    )
  }

  /* ──────────────────────────────────────────
     CHART
  ───────────────────────────────────────── */

  return (
    <div className="sales-chart-wrapper" aria-label="Sales chart" role="img">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={formattedData}
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
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 11,
              fill: '#94A3B8'
            }}
          />

          <YAxis
            width={40}
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 10,
              fill: '#94A3B8'
            }}
            tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              fill: 'rgba(15, 84, 105, 0.05)'
            }}
          />

          <Bar
            dataKey="revenue"
            fill="#0F5469"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

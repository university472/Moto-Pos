'use client'

import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { BarChart2, Loader2 } from 'lucide-react'

import api from '@/lib/api'

import type { ApiResponse } from '@/types/api'

import { formatPKR, formatDateTime } from '@/lib/utils'

import type { Sale } from '@/types/sale'

import './daily-report.css'

/* ──────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */

interface DailyReportData {
  date: string

  summary: {
    totalRevenue: number

    totalTransactions: number

    totalDiscount: number

    totalItems: number

    cashSales: number

    creditSales: number
  }

  sales: Sale[]
}

/* ──────────────────────────────────────────────
   COMPONENT
────────────────────────────────────────────── */

export default function DailyReportPage() {
  const today = new Date().toISOString().split('T')[0]

  const [selectedDate, setSelectedDate] = useState(today)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'daily', selectedDate],

    queryFn: async () => {
      const response = await api.get<ApiResponse<DailyReportData>>(
        `/reports/daily?date=${selectedDate}`
      )

      return response.data.data
    }
  })

  const summary = data?.summary

  const sales = data?.sales ?? []

  /* ──────────────────────────────────────────
     SUMMARY CARDS
  ───────────────────────────────────────── */

  const summaryCards = [
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
      label: 'Total Discount',

      value: formatPKR(summary?.totalDiscount ?? 0),

      color: '#F59E0B'
    },

    {
      label: 'Cash Sales',

      value: formatPKR(summary?.cashSales ?? 0),

      color: '#8B5CF6'
    }
  ]

  return (
    <div>
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart2 className="page-title-icon" />
            Daily Sales Report
          </h1>
        </div>

        {/* DATE FILTER */}

        <div className="date-filter-wrapper">
          <label htmlFor="report-date" className="sr-only">
            Select report date
          </label>

          <input
            id="report-date"
            type="date"
            value={selectedDate}
            max={today}
            title="Select report date"
            aria-label="Select report date"
            placeholder="Select date"
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {/* LOADING */}

      {isLoading ? (
        <div className="loading-wrapper">
          <Loader2 className="loading-spinner" />

          <span className="loading-text">Loading report...</span>
        </div>
      ) : (
        <>
          {/* SUMMARY */}

          <div className="summary-grid">
            {summaryCards.map((card) => (
              <div key={card.label} className="stat-card">
                <p className="stat-label">{card.label}</p>

                <p
                  className="stat-value"
                  style={{
                    color: card.color
                  }}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* TABLE */}

          <div className="report-table-wrapper">
            <div className="report-table-header">
              <p className="report-table-title">
                {sales.length} transaction
                {sales.length !== 1 ? 's' : ''} on {selectedDate}
              </p>
            </div>

            {sales.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">No sales recorded on this date.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice</th>

                    <th>Time</th>

                    <th>Customer</th>

                    <th className="text-right">Grand Total</th>

                    <th className="text-center">Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale._id}>
                      <td className="invoice-cell">{sale.invoiceNumber}</td>

                      <td className="muted-cell">
                        {formatDateTime(sale.createdAt)}
                      </td>

                      <td className="customer-cell">
                        {sale.customerName || 'Walk-in'}
                      </td>

                      <td className="grand-total-cell">
                        {formatPKR(sale.grandTotal)}
                      </td>

                      <td className="text-center">
                        <span className="payment-badge">
                          {sale.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}

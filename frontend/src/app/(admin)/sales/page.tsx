// frontend/src/app/(admin)/sales/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { TrendingUp, Loader2, Eye } from 'lucide-react'
import api from '@/lib/api'
import { ApiResponse } from '@/types/api'
import { Sale } from '@/types/sale'
import { formatPKR, formatDateTime } from '@/lib/utils'
import { Input } from '@/components/ui/input'

function useSalesList(page: number, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['sales', 'list', page, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      })
      const res = await api.get<
        ApiResponse<{
          sales: Sale[]
          pagination: {
            totalItems: number
            totalPages: number
            currentPage: number
          }
        }>
      >(`/sales?${params}`)
      return res.data.data
    }
  })
}

export default function SalesPage() {
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading } = useSalesList(page, startDate, endDate)
  const sales = data?.sales ?? []
  const pagination = data?.pagination

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" style={{ color: '#0F5469' }} />{' '}
            Sales History
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            All transactions with invoice details
          </p>
        </div>
      </div>

      {/* Date filters */}
      <div
        className="flex items-center gap-3 mb-4 p-4 bg-white rounded-lg border"
        style={{ borderColor: '#E2E8F0' }}
      >
        <span className="text-sm font-medium" style={{ color: '#64748B' }}>
          Filter by date:
        </span>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value)
            setPage(1)
          }}
          className="w-40 text-sm"
          style={{ borderColor: '#E2E8F0' }}
        />
        <span className="text-sm" style={{ color: '#94A3B8' }}>
          to
        </span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value)
            setPage(1)
          }}
          className="w-40 text-sm"
          style={{ borderColor: '#E2E8F0' }}
        />
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('')
              setEndDate('')
              setPage(1)
            }}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{
              backgroundColor: '#F8FAFC',
              color: '#64748B',
              border: '1px solid #E2E8F0'
            }}
          >
            Clear
          </button>
        )}
        {pagination && (
          <span className="ml-auto text-xs" style={{ color: '#94A3B8' }}>
            {pagination.totalItems} transaction
            {pagination.totalItems !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div
        className="bg-white rounded-lg border overflow-hidden"
        style={{ borderColor: '#E2E8F0' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{ color: '#0F5469' }}
            />
            <span className="ml-2 text-sm" style={{ color: '#64748B' }}>
              Loading sales...
            </span>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-medium" style={{ color: '#1E293B' }}>
              No sales found
            </p>
            <p className="text-sm" style={{ color: '#64748B' }}>
              Try adjusting the date filter.
            </p>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Cashier</th>
                  <th className="text-center">Items</th>
                  <th className="text-right">Grand Total</th>
                  <th className="text-center">Payment</th>
                  <th className="text-center">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>
                      <span
                        className="font-mono text-sm font-semibold"
                        style={{ color: '#0F5469' }}
                      >
                        {sale.invoiceNumber}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: '#64748B' }}>
                      {formatDateTime(sale.createdAt)}
                    </td>
                    <td className="text-sm" style={{ color: '#1E293B' }}>
                      {sale.customerName || (
                        <span style={{ color: '#CBD5E1' }}>Walk-in</span>
                      )}
                    </td>
                    <td className="text-sm" style={{ color: '#64748B' }}>
                      {typeof sale.cashier === 'object'
                        ? sale.cashier.name
                        : '—'}
                    </td>
                    <td
                      className="text-center text-sm font-numeric"
                      style={{ color: '#64748B' }}
                    >
                      {sale.items.length}
                    </td>
                    <td
                      className="text-right font-numeric font-bold text-sm"
                      style={{ color: '#1E293B' }}
                    >
                      {formatPKR(sale.grandTotal)}
                    </td>
                    <td className="text-center">
                      <span
                        className="text-xs capitalize font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: '#F8FAFC',
                          color: '#64748B',
                          border: '1px solid #E2E8F0'
                        }}
                      >
                        {sale.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-center">
                      {sale.isReturned ? (
                        <span className="badge-out-stock">Returned</span>
                      ) : (
                        <span className="badge-in-stock">Complete</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/sales/${sale._id}`}
                        className="p-1.5 rounded-md flex items-center"
                        style={{ color: '#64748B' }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLAnchorElement).style.color =
                            '#0F5469'
                          ;(
                            e.currentTarget as HTMLAnchorElement
                          ).style.backgroundColor = '#F8FAFC'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLAnchorElement).style.color =
                            '#64748B'
                          ;(
                            e.currentTarget as HTMLAnchorElement
                          ).style.backgroundColor = 'transparent'
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div
                className="flex items-center justify-between px-4 py-3 border-t"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
              >
                <p className="text-xs" style={{ color: '#64748B' }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium disabled:opacity-40"
                    style={{ borderColor: '#E2E8F0', color: '#64748B' }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium disabled:opacity-40"
                    style={{ borderColor: '#E2E8F0', color: '#64748B' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

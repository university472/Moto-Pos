// frontend/src/app/(admin)/purchases/[id]/page.tsx
// Full purchase detail — all items, supplier info, totals.

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Truck, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { ApiResponse } from '@/types/api'
import { Purchase } from '@/hooks/usePurchases'
import { formatPKR, formatDate, formatDateTime } from '@/lib/utils'

export default function PurchaseDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: purchase, isLoading } = useQuery({
    queryKey: ['purchases', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ purchase: Purchase }>>(
        `/purchases/${id}`
      )
      return res.data.data.purchase
    },
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: '#0F5469' }}
        />
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="text-center py-32">
        <p className="text-sm" style={{ color: '#DC2626' }}>
          Purchase not found.
        </p>
        <button
          onClick={() => router.push('/purchases')}
          className="text-sm font-medium mt-3 block mx-auto"
          style={{ color: '#0F5469' }}
        >
          Back to Purchases
        </button>
      </div>
    )
  }

  const supplier =
    typeof purchase.supplier === 'object' ? purchase.supplier : null
  const createdBy =
    typeof purchase.createdBy === 'object' ? purchase.createdBy : null

  return (
    <div className="max-w-3xl">
      <div className="page-header">
        <div>
          <button
            onClick={() => router.push('/purchases')}
            className="flex items-center gap-1 text-sm mb-1"
            style={{ color: '#64748B' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Purchases
          </button>
          <h1 className="flex items-center gap-2">
            <Truck className="h-6 w-6" style={{ color: '#0F5469' }} />
            {purchase.purchaseNumber}
          </h1>
        </div>
        <button
          onClick={() => window.print()}
          className="text-sm font-semibold px-4 py-2 rounded-lg border"
          style={{
            borderColor: '#E2E8F0',
            color: '#64748B',
            backgroundColor: '#FFFFFF'
          }}
        >
          Print Record
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Items */}
        <div className="col-span-2">
          <div
            className="bg-white rounded-lg border overflow-hidden"
            style={{ borderColor: '#E2E8F0' }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: '#E2E8F0' }}
            >
              <p className="font-semibold" style={{ color: '#1E293B' }}>
                Items Received ({purchase.items.length})
              </p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-center">Qty Received</th>
                  <th className="text-right">Cost/Unit</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <p
                        className="font-medium text-sm"
                        style={{ color: '#1E293B' }}
                      >
                        {item.productName}
                      </p>
                    </td>
                    <td
                      className="text-center font-numeric text-sm"
                      style={{ color: '#64748B' }}
                    >
                      {item.quantityReceived}
                    </td>
                    <td
                      className="text-right font-numeric text-sm"
                      style={{ color: '#64748B' }}
                    >
                      {formatPKR(item.purchasePricePerUnit)}
                    </td>
                    <td
                      className="text-right font-numeric font-semibold text-sm"
                      style={{ color: '#1E293B' }}
                    >
                      {formatPKR(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="flex justify-between items-center px-5 py-4 border-t"
              style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
            >
              <span className="font-semibold" style={{ color: '#1E293B' }}>
                Total Paid
              </span>
              <span
                className="text-xl font-bold font-numeric"
                style={{ color: '#0F5469' }}
              >
                {formatPKR(purchase.totalAmount)}
              </span>
            </div>
          </div>

          {purchase.notes && (
            <div
              className="mt-4 bg-white rounded-lg border p-5"
              style={{ borderColor: '#E2E8F0' }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: '#94A3B8' }}
              >
                Notes / Supplier Invoice
              </p>
              <p className="text-sm" style={{ color: '#64748B' }}>
                {purchase.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div
            className="bg-white rounded-lg border p-5"
            style={{ borderColor: '#E2E8F0' }}
          >
            <h3
              className="font-semibold mb-3 text-sm"
              style={{ color: '#1E293B' }}
            >
              Purchase Info
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-0.5"
                  style={{ color: '#94A3B8' }}
                >
                  Purchase Date
                </p>
                <p className="font-medium" style={{ color: '#1E293B' }}>
                  {formatDate(purchase.purchaseDate)}
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-0.5"
                  style={{ color: '#94A3B8' }}
                >
                  Recorded At
                </p>
                <p style={{ color: '#64748B' }}>
                  {formatDateTime(purchase.createdAt)}
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-0.5"
                  style={{ color: '#94A3B8' }}
                >
                  Recorded By
                </p>
                <p className="font-medium" style={{ color: '#1E293B' }}>
                  {createdBy?.name ?? '—'}
                </p>
              </div>
            </div>
          </div>

          {supplier && (
            <div
              className="bg-white rounded-lg border p-5"
              style={{ borderColor: '#E2E8F0' }}
            >
              <h3
                className="font-semibold mb-3 text-sm"
                style={{ color: '#1E293B' }}
              >
                Supplier
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-semibold" style={{ color: '#1E293B' }}>
                  {supplier.name}
                </p>
                {supplier.phone && (
                  <p style={{ color: '#64748B' }}>📞 {supplier.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

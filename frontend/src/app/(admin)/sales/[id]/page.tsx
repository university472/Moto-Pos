// frontend/src/app/(admin)/sales/[id]/page.tsx
// View any past sale invoice from admin panel with Reprint button.
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Printer, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { ApiResponse } from '@/types/api'
import { Sale } from '@/types/sale'
import { formatPKR, formatDateTime } from '@/lib/utils'
import { useSettings } from '@/hooks/useSettings'

export default function SaleDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: settings } = useSettings()

  const { data: sale, isLoading } = useQuery({
    queryKey: ['sales', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ sale: Sale }>>(`/sales/${id}`)
      return res.data.data.sale
    },
    enabled: !!id
  })

  const shopName = settings?.shopname ?? 'Moto Parts Shop'
  const shopAddress = settings?.shopaddress ?? ''
  const shopPhone = settings?.shopphone ?? ''
  const invoiceFooter =
    settings?.invoicefooter ?? 'Thank you for your business!'

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

  if (!sale) {
    return (
      <div className="text-center py-32">
        <p className="text-sm" style={{ color: '#DC2626' }}>
          Sale not found.
        </p>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium mt-3"
          style={{ color: '#0F5469' }}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="no-print page-header">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: '#64748B' }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sales
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: '#0F5469' }}
        >
          <Printer className="h-4 w-4" /> Print Invoice
        </button>
      </div>

      <div
        className="invoice-print bg-white max-w-2xl mx-auto rounded-xl border p-8"
        style={{ borderColor: '#E2E8F0' }}
      >
        {/* Header */}
        <div
          className="text-center pb-6 mb-6 border-b"
          style={{ borderColor: '#E2E8F0' }}
        >
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0F5469' }}>
            {shopName}
          </h1>
          <p className="text-sm" style={{ color: '#64748B' }}>
            {shopAddress}
          </p>
          <p className="text-sm" style={{ color: '#64748B' }}>
            {shopPhone}
          </p>
          <div className="mt-4 flex justify-between">
            <div className="text-left">
              <p
                className="text-xs uppercase tracking-wider"
                style={{ color: '#94A3B8' }}
              >
                Invoice
              </p>
              <p
                className="font-bold font-numeric"
                style={{ color: '#0F5469' }}
              >
                {sale.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-xs uppercase tracking-wider"
                style={{ color: '#94A3B8' }}
              >
                Date
              </p>
              <p className="font-medium text-sm" style={{ color: '#1E293B' }}>
                {formatDateTime(sale.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th
                className="text-left pb-2 font-semibold text-xs uppercase"
                style={{ color: '#64748B' }}
              >
                Item
              </th>
              <th
                className="text-center pb-2 font-semibold text-xs uppercase w-16"
                style={{ color: '#64748B' }}
              >
                Qty
              </th>
              <th
                className="text-right pb-2 font-semibold text-xs uppercase w-24"
                style={{ color: '#64748B' }}
              >
                Price
              </th>
              <th
                className="text-right pb-2 font-semibold text-xs uppercase w-24"
                style={{ color: '#64748B' }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td className="py-2.5">
                  <p className="font-medium" style={{ color: '#1E293B' }}>
                    {item.productName}
                  </p>
                  <p className="text-xs font-mono" style={{ color: '#94A3B8' }}>
                    {item.productSku}
                  </p>
                </td>
                <td
                  className="py-2.5 text-center font-numeric"
                  style={{ color: '#64748B' }}
                >
                  {item.quantity}
                </td>
                <td
                  className="py-2.5 text-right font-numeric"
                  style={{ color: '#64748B' }}
                >
                  {formatPKR(item.unitPrice)}
                </td>
                <td
                  className="py-2.5 text-right font-numeric font-semibold"
                  style={{ color: '#1E293B' }}
                >
                  {formatPKR(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div
          className="border-t pt-4 space-y-2"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div className="flex justify-between text-sm">
            <span style={{ color: '#64748B' }}>Subtotal</span>
            <span className="font-numeric">{formatPKR(sale.subtotal)}</span>
          </div>
          {sale.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: '#16A34A' }}>Discount</span>
              <span className="font-numeric" style={{ color: '#16A34A' }}>
                − {formatPKR(sale.discountAmount)}
              </span>
            </div>
          )}
          <div
            className="flex justify-between pt-3 border-t"
            style={{ borderColor: '#E2E8F0' }}
          >
            <span className="font-bold text-base" style={{ color: '#0F5469' }}>
              Grand Total
            </span>
            <span
              className="font-bold font-numeric text-2xl"
              style={{ color: '#0F5469' }}
            >
              {formatPKR(sale.grandTotal)}
            </span>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span style={{ color: '#94A3B8' }}>Payment</span>
            <span
              className="capitalize font-medium"
              style={{ color: '#64748B' }}
            >
              {sale.paymentMethod.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div
          className="mt-6 pt-4 border-t text-center"
          style={{ borderColor: '#F1F5F9' }}
        >
          <p className="text-xs" style={{ color: '#94A3B8' }}>
            {invoiceFooter}
          </p>
        </div>
      </div>
    </div>
  )
}

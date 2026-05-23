// frontend/src/app/(cashier)/pos/invoice/[id]/page.tsx

'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Printer, ArrowLeft, Loader2, RotateCcw } from 'lucide-react'

import api from '@/lib/api'

import { ApiResponse } from '@/types/api'

import { Sale } from '@/types/sale'

import { useSettings } from '@/hooks/useSettings'

import {
  formatPKR,
  formatDateTime,
  formatDate,
  getCashierName
} from '@/lib/utils'

export default function InvoicePage() {
  const params = useParams()

  const router = useRouter()

  const saleId = params.id as string

  const [sale, setSale] = useState<Sale | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const { data: settings } = useSettings()

  const shopName = settings?.shopname ?? 'Moto Parts Shop'

  const shopAddress = settings?.shopaddress ?? ''

  const shopPhone = settings?.shopphone ?? ''

  const invoiceFooter =
    settings?.invoicefooter ?? 'Thank you for your business!'

  const fetchSale = async () => {
    try {
      setIsLoading(true)

      setError(null)

      const response = await api.get<ApiResponse<{ sale: Sale }>>(
        `/sales/${saleId}`
      )

      setSale(response.data.data.sale)
    } catch {
      setError('Could not load invoice. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const loadSale = async () => {
      if (mounted && saleId) {
        await fetchSale()
      }
    }

    loadSale()

    return () => {
      mounted = false
    }
  }, [saleId])

  // ─────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-800" />

          <p className="text-sm text-slate-500">Loading invoice...</p>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // Error state
  // ─────────────────────────────────────────────
  if (error || !sale) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-sm font-medium mb-4 text-red-600">
            {error || 'Invoice not found.'}
          </p>

          <button
            onClick={() => router.push('/pos')}
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg bg-cyan-800 hover:bg-cyan-700 transition-colors"
          >
            Back to POS
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 px-4 bg-slate-50">
      {/* Action buttons */}
      <div className="no-print flex items-center justify-between mb-6 max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/pos')}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          New Sale
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => {
              document.body.classList.add('thermal-print')

              window.print()

              setTimeout(() => {
                document.body.classList.remove('thermal-print')
              }, 1000)
            }}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Thermal
          </button>

          <button
            onClick={() => {
              document.body.classList.remove('thermal-print')

              window.print()
            }}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-lg text-white bg-cyan-800 hover:bg-cyan-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print A4
          </button>
        </div>
      </div>

      {/* Invoice */}
      <div className="invoice-print bg-white max-w-2xl mx-auto rounded-xl border border-slate-200 p-8">
        {/* Header */}
        <div className="text-center pb-6 mb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold mb-1 text-cyan-800">{shopName}</h1>

          <p className="text-sm text-slate-500">{shopAddress}</p>

          <p className="text-sm text-slate-500">{shopPhone}</p>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
            <div className="text-left">
              <p className="text-xs uppercase tracking-wider mb-1 text-slate-400">
                Invoice No.
              </p>

              <p className="font-bold font-numeric text-lg text-cyan-800">
                {sale.invoiceNumber}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-wider mb-1 text-slate-400">
                Date & Time
              </p>

              <p className="font-medium text-sm text-slate-800">
                {formatDateTime(sale.createdAt)}
              </p>
            </div>
          </div>

          {sale.customerName && (
            <div className="mt-3 text-left">
              <p className="text-xs uppercase tracking-wider mb-0.5 text-slate-400">
                Customer
              </p>

              <p className="font-medium text-sm text-slate-800">
                {sale.customerName}
              </p>
            </div>
          )}
        </div>

        {/* Items */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left pb-2 font-semibold text-xs uppercase text-slate-500">
                Item
              </th>

              <th className="text-center pb-2 font-semibold text-xs uppercase w-16 text-slate-500">
                Qty
              </th>

              <th className="text-right pb-2 font-semibold text-xs uppercase w-24 text-slate-500">
                Price
              </th>

              <th className="text-right pb-2 font-semibold text-xs uppercase w-24 text-slate-500">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2.5">
                  <p className="font-medium text-slate-800">
                    {item.productName}
                  </p>

                  <p className="text-xs font-mono text-slate-400">
                    {item.productSku}
                  </p>
                </td>

                <td className="py-2.5 text-center font-numeric text-slate-500">
                  {item.quantity}
                </td>

                <td className="py-2.5 text-right font-numeric text-slate-500">
                  {formatPKR(item.unitPrice)}
                </td>

                <td className="py-2.5 text-right font-numeric font-semibold text-slate-800">
                  {formatPKR(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>

            <span className="font-numeric">{formatPKR(sale.subtotal)}</span>
          </div>

          {sale.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">
                Discount
                {sale.discountType === 'percentage'
                  ? ` (${sale.discountValue}%)`
                  : ' (Flat)'}
              </span>

              <span className="font-numeric text-green-600">
                − {formatPKR(sale.discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t border-slate-200">
            <span className="font-bold text-base uppercase tracking-wide text-cyan-800">
              Grand Total
            </span>

            <span className="font-bold font-numeric text-2xl text-cyan-800">
              {formatPKR(sale.grandTotal)}
            </span>
          </div>

          <div className="flex justify-between text-xs pt-1">
            <span className="text-slate-400">Payment Method</span>

            <span className="font-medium capitalize text-slate-500">
              {sale.paymentMethod.replace('_', ' ')}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Served by</span>

            <span className="text-slate-500">
              {getCashierName(sale.cashier)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">{invoiceFooter}</p>

          <p className="text-xs mt-1 font-mono text-slate-300">
            {sale.invoiceNumber} · {formatDate(sale.createdAt)}
          </p>
        </div>
      </div>

      {/* Reload */}
      <div className="no-print max-w-2xl mx-auto mt-4 flex justify-center">
        <button
          onClick={fetchSale}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reload invoice
        </button>
      </div>
    </div>
  )
}

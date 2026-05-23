// frontend/src/app/(admin)/returns/page.tsx

'use client'

import { useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { z } from 'zod'

import { RotateCcw, Plus, Loader2, Search } from 'lucide-react'

import api from '@/lib/api'

import { ApiResponse } from '@/types/api'

import { toast } from 'sonner'

import { formatPKR, formatDateTime } from '@/lib/utils'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

interface ReturnRecord {
  _id: string

  returnNumber: string

  originalSale: {
    _id: string
    invoiceNumber: string
    grandTotal: number
  }

  processedBy: {
    name: string
  }

  items: {
    productName: string
    quantityReturned: number
    refundAmount: number
  }[]

  totalRefund: number

  reason: string

  refundMethod: string

  createdAt: string
}

const returnSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),

  reason: z.string().min(3, 'Reason must be at least 3 characters').max(300),

  refundMethod: z.enum(['cash', 'exchange', 'credit'])
})

type ReturnFormValues = z.infer<typeof returnSchema>

export default function ReturnsPage() {
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [foundSale, setFoundSale] = useState<{
    _id: string
    invoiceNumber: string
    grandTotal: number
    items: {
      product: string
      productName: string
      quantity: number
      unitPrice: number
    }[]
  } | null>(null)

  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({})

  const [isSearching, setIsSearching] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),

    defaultValues: {
      invoiceNumber: '',
      reason: '',
      refundMethod: 'cash'
    }
  })

  const { data, isLoading } = useQuery({
    queryKey: ['returns', 'list'],

    queryFn: async () => {
      const res = await api.get<
        ApiResponse<{
          returns: ReturnRecord[]
        }>
      >('/returns')

      return res.data.data.returns
    }
  })

  const handleSearchInvoice = async () => {
    const invoiceNumber = form.getValues('invoiceNumber').trim().toUpperCase()

    if (!invoiceNumber) {
      return
    }

    setIsSearching(true)

    try {
      const res = await api.get<
        ApiResponse<{
          sale: typeof foundSale
        }>
      >(`/sales/invoice/${invoiceNumber}`)

      const sale = res.data.data.sale

      if (!sale) {
        throw new Error('Not found')
      }

      setFoundSale(sale)

      // Default select all
      const defaults: Record<string, number> = {}

      sale.items.forEach((item: { product: string; quantity: number }) => {
        defaults[item.product] = item.quantity
      })

      setSelectedItems(defaults)
    } catch {
      toast.error('Invoice not found', {
        description: `No sale found with invoice number "${invoiceNumber}"`
      })

      setFoundSale(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmitReturn = async (formData: ReturnFormValues) => {
    if (!foundSale) {
      return
    }

    const itemsToReturn = Object.entries(selectedItems)
      .filter(([, qty]) => qty > 0)
      .map(([product, quantityReturned]) => ({
        product,
        quantityReturned
      }))

    if (itemsToReturn.length === 0) {
      toast.error('Select at least one item to return')

      return
    }

    setIsSubmitting(true)

    try {
      await api.post('/returns', {
        originalSale: foundSale._id,
        items: itemsToReturn,
        reason: formData.reason,
        refundMethod: formData.refundMethod
      })

      queryClient.invalidateQueries({
        queryKey: ['returns']
      })

      queryClient.invalidateQueries({
        queryKey: ['products']
      })

      queryClient.invalidateQueries({
        queryKey: ['inventory']
      })

      toast.success('Return processed', {
        description: 'Stock has been restored.'
      })

      setIsModalOpen(false)

      setFoundSale(null)

      form.reset()
    } catch (e: unknown) {
      const err = e as {
        response?: {
          data?: {
            message?: string
          }
        }
      }

      toast.error('Return failed', {
        description: err?.response?.data?.message ?? 'An error occurred.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const returns = data ?? []

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-cyan-800" />
            Returns
          </h1>

          <p className="text-sm mt-0.5 text-slate-500">
            Process customer returns — stock is automatically restored
          </p>
        </div>

        <Button
          title="Process return"
          aria-label="Process return"
          onClick={() => {
            setFoundSale(null)

            form.reset()

            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 text-white font-semibold bg-cyan-800 hover:bg-cyan-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Process Return
        </Button>
      </div>

      {/* Returns table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-800" />

            <span className="ml-2 text-sm text-slate-500">
              Loading returns...
            </span>
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-16">
            <RotateCcw className="h-10 w-10 mx-auto mb-3 text-slate-200" />

            <p className="text-sm font-medium text-slate-800">No returns yet</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Return No.</th>

                <th>Original Invoice</th>

                <th>Items Returned</th>

                <th className="text-right">Total Refund</th>

                <th>Refund Method</th>

                <th>Reason</th>

                <th>Date</th>

                <th>Processed By</th>
              </tr>
            </thead>

            <tbody>
              {returns.map((ret) => (
                <tr key={ret._id}>
                  <td className="font-mono font-semibold text-sm text-cyan-800">
                    {ret.returnNumber}
                  </td>

                  <td className="font-mono text-sm text-slate-500">
                    {typeof ret.originalSale === 'object'
                      ? ret.originalSale.invoiceNumber
                      : ret.originalSale}
                  </td>

                  <td className="text-sm text-slate-500">
                    {ret.items
                      .map((i) => `${i.productName} (×${i.quantityReturned})`)
                      .join(', ')}
                  </td>

                  <td className="text-right font-numeric font-bold text-sm text-green-600">
                    {formatPKR(ret.totalRefund)}
                  </td>

                  <td>
                    <span className="text-xs capitalize px-2 py-0.5 rounded-full font-medium bg-slate-50 text-slate-500 border border-slate-200">
                      {ret.refundMethod}
                    </span>
                  </td>

                  <td className="text-sm max-w-xs truncate text-slate-500">
                    {ret.reason}
                  </td>

                  <td className="text-sm text-slate-500">
                    {formatDateTime(ret.createdAt)}
                  </td>

                  <td className="text-sm text-slate-500">
                    {typeof ret.processedBy === 'object'
                      ? ret.processedBy.name
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(o) => {
          if (!o) {
            setIsModalOpen(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Process Customer Return</DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {/* Invoice */}
            <div className="space-y-1.5">
              <Label className="text-slate-500">Invoice Number *</Label>

              <div className="flex gap-2">
                <Input
                  title="Invoice number"
                  aria-label="Invoice number"
                  placeholder="e.g. INV-2024-00001"
                  {...form.register('invoiceNumber')}
                  className="font-mono uppercase border-slate-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()

                      handleSearchInvoice()
                    }
                  }}
                />

                <Button
                  type="button"
                  title="Search invoice"
                  aria-label="Search invoice"
                  onClick={handleSearchInvoice}
                  disabled={isSearching}
                  className="flex items-center gap-2 text-white px-4 bg-cyan-800 hover:bg-cyan-700"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Found Sale */}
            {foundSale && (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-500">
                    {foundSale.invoiceNumber} — Select items to return
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {foundSale.items.map((item) => (
                    <div
                      key={item.product}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {item.productName}
                        </p>

                        <p className="text-xs text-slate-400">
                          Sold: {item.quantity} × {formatPKR(item.unitPrice)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          Return qty:
                        </span>

                        <input
                          type="number"
                          min={0}
                          max={item.quantity}
                          title={`Return quantity for ${item.productName}`}
                          aria-label={`Return quantity for ${item.productName}`}
                          placeholder="0"
                          value={selectedItems[item.product] ?? 0}
                          onChange={(e) =>
                            setSelectedItems((prev) => ({
                              ...prev,
                              [item.product]: Math.min(
                                item.quantity,
                                Math.max(0, parseInt(e.target.value) || 0)
                              )
                            }))
                          }
                          className="w-16 text-center text-sm font-numeric px-2 py-1 rounded border border-slate-200 outline-none focus:border-cyan-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-1.5">
              <Label className="text-slate-500">Return Reason *</Label>

              <Input
                title="Return reason"
                aria-label="Return reason"
                placeholder="e.g. Defective part"
                {...form.register('reason')}
                className={
                  form.formState.errors.reason
                    ? 'border-red-600'
                    : 'border-slate-200'
                }
              />

              {form.formState.errors.reason && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.reason.message}
                </p>
              )}
            </div>

            {/* Refund Method */}
            <div className="space-y-1.5">
              <Label className="text-slate-500">Refund Method *</Label>

              <select
                title="Refund method"
                aria-label="Refund method"
                {...form.register('refundMethod')}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 outline-none text-slate-800"
              >
                <option value="cash">Cash</option>

                <option value="exchange">Exchange / Replace</option>

                <option value="credit">Store Credit</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              title="Cancel"
              aria-label="Cancel"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              title="Process return"
              aria-label="Process return"
              onClick={form.handleSubmit(handleSubmitReturn)}
              disabled={!foundSale || isSubmitting}
              className={`text-white ${
                !foundSale ? 'bg-slate-300' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Process Return'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

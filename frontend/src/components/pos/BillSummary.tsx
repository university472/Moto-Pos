// frontend/src/components/pos/BillSummary.tsx

'use client'

import { useState } from 'react'

import {
  Trash2,
  Printer,
  Loader2,
  User,
  ChevronDown,
  FileText
} from 'lucide-react'

import { useCartStore } from '@/store/cartStore'

import { formatPKR } from '@/lib/utils'

import type { DiscountType, PaymentMethod } from '@/types/sale'

interface BillSummaryProps {
  onGenerateBill: () => Promise<void>
  isSubmitting: boolean
}

export function BillSummary({
  onGenerateBill,
  isSubmitting
}: BillSummaryProps) {
  const {
    items,
    discountType,
    discountValue,
    customerName,
    paymentMethod,
    notes,
    setDiscount,
    setCustomerName,
    setPaymentMethod,
    setNotes,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getGrandTotal,
    getItemCount
  } = useCartStore()

  const [discountInput, setDiscountInput] = useState(
    discountValue > 0 ? String(discountValue) : ''
  )

  const subtotal = getSubtotal()

  const discountAmount = getDiscountAmount()

  const grandTotal = getGrandTotal()

  const itemCount = getItemCount()

  const isEmpty = items.length === 0

  const handleDiscountTypeChange = (type: DiscountType) => {
    setDiscount(type, 0)

    setDiscountInput('')
  }

  const handleDiscountValueChange = (raw: string) => {
    setDiscountInput(raw)

    const parsed = parseFloat(raw)

    if (!isNaN(parsed) && parsed >= 0) {
      const capped =
        discountType === 'percentage' ? Math.min(parsed, 100) : parsed

      setDiscount(discountType, capped)
    } else {
      setDiscount(discountType, 0)
    }
  }

  const paymentOptions: {
    value: PaymentMethod
    label: string
  }[] = [
    {
      value: 'cash',
      label: 'Cash'
    },
    {
      value: 'credit',
      label: 'Credit'
    },
    {
      value: 'bank_transfer',
      label: 'Bank Transfer'
    }
  ]

  return (
    <div className="bill-summary-root border-t flex flex-col gap-0">
      {/* Totals */}
      <div className="px-4 pt-3 pb-2 space-y-1.5">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="summary-muted-text text-sm">
            Subtotal ({itemCount} item
            {itemCount !== 1 ? 's' : ''})
          </span>

          <span className="summary-price-text text-sm font-medium font-numeric">
            {formatPKR(subtotal)}
          </span>
        </div>

        {/* Discount Type */}
        <div className="flex items-center gap-2">
          <span className="summary-muted-text text-sm flex-shrink-0">
            Discount
          </span>

          <div className="flex gap-1 ml-auto">
            {(['none', 'percentage', 'flat'] as DiscountType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleDiscountTypeChange(type)}
                className={`
                  discount-type-btn
                  ${discountType === type ? 'discount-type-btn-active' : ''}
                `}
                title={`Select ${type} discount`}
              >
                {type === 'none'
                  ? 'None'
                  : type === 'percentage'
                    ? '%'
                    : 'Flat'}
              </button>
            ))}
          </div>
        </div>

        {/* Discount Value */}
        {discountType !== 'none' && (
          <div className="flex items-center gap-2">
            <span className="summary-muted-text text-xs">
              {discountType === 'percentage'
                ? 'Percent off'
                : 'Amount off (PKR)'}
            </span>

            <div className="flex items-center gap-1 ml-auto">
              <span className="summary-light-text text-xs">
                {discountType === 'percentage' ? '%' : 'Rs.'}
              </span>

              <input
                type="number"
                value={discountInput}
                onChange={(e) => handleDiscountValueChange(e.target.value)}
                min={0}
                max={discountType === 'percentage' ? 100 : undefined}
                step={discountType === 'percentage' ? 1 : 10}
                placeholder="0"
                title="Discount value"
                aria-label="Discount value"
                className="discount-input"
              />
            </div>
          </div>
        )}

        {/* Discount Amount */}
        {discountAmount > 0 && (
          <div className="flex justify-between items-center">
            <span className="discount-success-text text-sm">
              Discount Applied
            </span>

            <span className="discount-success-text text-sm font-medium font-numeric">
              − {formatPKR(discountAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="grand-total-box px-4 py-3 mx-4 mb-3 rounded-xl">
        <div className="flex justify-between items-center">
          <span className="grand-total-label">Grand Total</span>

          <span className="grand-total-value font-numeric">
            {formatPKR(grandTotal)}
          </span>
        </div>
      </div>

      {/* Customer Name */}
      <div className="px-4 mb-3">
        <div className="customer-input-wrapper flex items-center gap-2 px-3 py-2 rounded-lg border">
          <User className="customer-icon h-4 w-4 flex-shrink-0" />

          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer name (optional)"
            title="Customer name"
            aria-label="Customer name"
            maxLength={100}
            className="customer-input flex-1 text-sm outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="px-4 mb-3">
        <div className="customer-input-wrapper flex items-start gap-2 px-3 py-2 rounded-lg border">
          <FileText className="customer-icon h-4 w-4 flex-shrink-0 mt-1" />

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes (optional)"
            rows={2}
            maxLength={300}
            className="flex-1 text-sm outline-none bg-transparent resize-none"
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className="px-4 mb-3">
        <div className="relative">
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            title="Payment method"
            aria-label="Payment method"
            className="payment-select w-full appearance-none text-sm px-3 py-2.5 rounded-lg border outline-none"
          >
            {paymentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                💳 Payment: {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="payment-chevron absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
        </div>
      </div>

      {/* Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        {/* Clear */}
        <button
          type="button"
          onClick={clearCart}
          disabled={isEmpty || isSubmitting}
          className={`
            clear-cart-btn
            flex
            items-center
            gap-2
            px-4
            py-3
            rounded-lg
            text-sm
            font-semibold
            border
            transition-colors

            ${isEmpty || isSubmitting ? 'clear-cart-btn-disabled' : ''}
          `}
          title="Clear cart"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>

        {/* Generate */}
        <button
          type="button"
          onClick={onGenerateBill}
          disabled={isEmpty || isSubmitting}
          className={`
            generate-bill-btn
            flex-1
            flex
            items-center
            justify-center
            gap-2
            py-3
            rounded-lg
            text-sm
            font-bold
            text-white
            transition-all
            duration-150

            ${isEmpty || isSubmitting ? 'generate-bill-btn-disabled' : ''}
          `}
          title="Generate bill"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Printer className="h-4 w-4" />
              Generate Bill
            </>
          )}
        </button>
      </div>
    </div>
  )
}

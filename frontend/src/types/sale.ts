// frontend/src/types/sale.ts
// TypeScript interfaces for Sale collection — mirrors Section 8 schema exactly.
// UPDATED:
// cashier can now be either:
//   - populated object
//   - ObjectId string
// This prevents invoice page crashes when population fails.

export type DiscountType = 'percentage' | 'flat' | 'none'

export type PaymentMethod = 'cash' | 'credit' | 'bank_transfer'

// ── Individual item inside a sale ────────────────────────────────────────
export interface SaleItem {
  product: string

  productName: string

  productSku: string

  quantity: number

  unitPrice: number

  purchasePrice: number

  subtotal: number
}

// ── Cashier type ─────────────────────────────────────────────────────────
export type SaleCashier =
  | string
  | {
      _id: string
      name: string
      username: string
    }

// ── Full sale document ───────────────────────────────────────────────────
export interface Sale {
  _id: string

  invoiceNumber: string

  cashier: SaleCashier

  customerName?: string

  items: SaleItem[]

  subtotal: number

  discountType: DiscountType

  discountValue: number

  discountAmount: number

  grandTotal: number

  paymentMethod: PaymentMethod

  notes?: string

  isReturned: boolean

  createdAt: string
}

// ── Create sale payload ──────────────────────────────────────────────────
export interface CreateSalePayload {
  customerName?: string

  items: {
    product: string
    quantity: number
  }[]

  discountType: DiscountType

  discountValue: number

  paymentMethod: PaymentMethod

  notes?: string
}

// ── Cart item ────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string

  productName: string

  sku: string

  unitPrice: number

  purchasePrice: number

  quantity: number

  subtotal: number

  stockQty: number
}

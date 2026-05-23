// frontend/src/store/cartStore.ts
// Zustand cart store — exact code from Section 10 of the planning report,
// extended with:
//   - stockQty per item (for out-of-stock warning before Generate Bill)
//   - paymentMethod field
//   - setCustomerName action
//   - itemCount derived selector
//   - out-of-stock guard in addItem (cannot add if stockQty === 0)
//   - quantity cap at stockQty (cannot add more than what's in stock)
//   - notes field + setNotes action

import { create } from 'zustand'

import { ProductSearchResult } from '@/types/product'

import { DiscountType, PaymentMethod } from '@/types/sale'

// ── Cart item shape ────────────────────────────────────────────────────────
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

// ── Full store shape ───────────────────────────────────────────────────────
interface CartStore {
  // ── State ──────────────────────────────────────────────────────────────
  items: CartItem[]

  discountType: DiscountType

  discountValue: number

  customerName: string

  paymentMethod: PaymentMethod

  notes: string

  // ── Actions ────────────────────────────────────────────────────────────
  addItem: (product: ProductSearchResult) => void

  removeItem: (productId: string) => void

  updateQuantity: (productId: string, qty: number) => void

  setDiscount: (type: DiscountType, value: number) => void

  setCustomerName: (name: string) => void

  setPaymentMethod: (method: PaymentMethod) => void

  setNotes: (notes: string) => void

  clearCart: () => void

  // ── Computed getters ──────────────────────────────────────────────────
  getSubtotal: () => number

  getDiscountAmount: () => number

  getGrandTotal: () => number

  getItemCount: () => number

  hasOutOfStockItems: () => boolean
}

// ── Zustand store ─────────────────────────────────────────────────────────
export const useCartStore = create<CartStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────
  items: [],

  discountType: 'none',

  discountValue: 0,

  customerName: '',

  paymentMethod: 'cash',

  notes: '',

  // ── addItem ───────────────────────────────────────────────────────────
  addItem: (product: ProductSearchResult) =>
    set((state) => {
      // Guard: cannot add out-of-stock product
      if (product.stockQty <= 0) {
        return state
      }

      const existing = state.items.find(
        (item) => item.productId === product._id
      )

      // Existing item
      if (existing) {
        const newQty = existing.quantity + 1

        // Prevent exceeding stock
        if (newQty > product.stockQty) {
          return state
        }

        return {
          items: state.items.map((item) =>
            item.productId === product._id
              ? {
                  ...item,
                  quantity: newQty,
                  subtotal: newQty * item.unitPrice
                }
              : item
          )
        }
      }

      // New item
      return {
        items: [
          ...state.items,
          {
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            unitPrice: product.salePrice,
            purchasePrice: product.purchasePrice,
            quantity: 1,
            subtotal: product.salePrice,
            stockQty: product.stockQty
          }
        ]
      }
    }),

  // ── removeItem ────────────────────────────────────────────────────────
  removeItem: (productId: string) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId)
    })),

  // ── updateQuantity ────────────────────────────────────────────────────
  updateQuantity: (productId: string, qty: number) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.min(qty, item.stockQty),
                subtotal: Math.min(qty, item.stockQty) * item.unitPrice
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    })),

  // ── setDiscount ───────────────────────────────────────────────────────
  setDiscount: (type: DiscountType, value: number) =>
    set({
      discountType: type,
      discountValue: value
    }),

  // ── setCustomerName ───────────────────────────────────────────────────
  setCustomerName: (name: string) =>
    set({
      customerName: name
    }),

  // ── setPaymentMethod ──────────────────────────────────────────────────
  setPaymentMethod: (method: PaymentMethod) =>
    set({
      paymentMethod: method
    }),

  // ── setNotes ──────────────────────────────────────────────────────────
  setNotes: (notes: string) =>
    set({
      notes
    }),

  // ── clearCart ─────────────────────────────────────────────────────────
  clearCart: () =>
    set({
      items: [],
      discountType: 'none',
      discountValue: 0,
      customerName: '',
      paymentMethod: 'cash',
      notes: ''
    }),

  // ── getSubtotal ───────────────────────────────────────────────────────
  getSubtotal: () => get().items.reduce((sum, item) => sum + item.subtotal, 0),

  // ── getDiscountAmount ─────────────────────────────────────────────────
  getDiscountAmount: () => {
    const { discountType, discountValue, getSubtotal } = get()

    const subtotal = getSubtotal()

    if (discountType === 'percentage') {
      return Math.min((subtotal * discountValue) / 100, subtotal)
    }

    if (discountType === 'flat') {
      return Math.min(discountValue, subtotal)
    }

    return 0
  },

  // ── getGrandTotal ─────────────────────────────────────────────────────
  getGrandTotal: () => get().getSubtotal() - get().getDiscountAmount(),

  // ── getItemCount ──────────────────────────────────────────────────────
  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  // ── hasOutOfStockItems ────────────────────────────────────────────────
  hasOutOfStockItems: () =>
    get().items.some((item) => item.quantity > item.stockQty)
}))

// backend/src/validators/sale.validator.ts
// Zod schemas for Sale API requests.
// The frontend sends product IDs + quantities — prices come from DB (never trusted from client).

import { z } from 'zod'

// ── MongoDB ObjectId validation ────────────────────────────────────────────
const mongoIdSchema = z
  .string()
  .min(1, { message: 'Product ID is required' })
  .regex(/^[a-f\d]{24}$/i, {
    message: 'Invalid product ID format'
  })

// ── Single item in the sale request ───────────────────────────────────────
const saleItemInputSchema = z.object({
  product: mongoIdSchema,

  quantity: z
    .number()
    .int({ message: 'Quantity must be a whole number' })
    .min(1, { message: 'Quantity must be at least 1' })
    .max(9999, { message: 'Quantity cannot exceed 9999' })
})

// ── POST /api/v1/sales ─────────────────────────────────────────────────────
export const createSaleSchema = z.object({
  customerName: z
    .string()
    .max(100, {
      message: 'Customer name cannot exceed 100 characters'
    })
    .trim()
    .optional()
    .default(''),

  items: z
    .array(saleItemInputSchema)
    .min(1, {
      message: 'Sale must contain at least one item'
    })
    .max(50, {
      message: 'A single sale cannot contain more than 50 different products'
    }),

  discountType: z
    .enum(['percentage', 'flat', 'none'], {
      message: 'Discount type must be percentage, flat, or none'
    })
    .default('none'),

  discountValue: z
    .number()
    .min(0, {
      message: 'Discount value cannot be negative'
    })
    .max(100, {
      message: 'Percentage discount cannot exceed 100%'
    })
    .default(0),

  paymentMethod: z
    .enum(['cash', 'credit', 'bank_transfer'], {
      message: 'Payment method must be cash, credit, or bank_transfer'
    })
    .default('cash'),

  notes: z
    .string()
    .max(300, {
      message: 'Notes cannot exceed 300 characters'
    })
    .trim()
    .optional()
    .default('')
})

export type CreateSaleInput = z.infer<typeof createSaleSchema>

// ── GET /api/v1/sales (query params for list + date filter) ───────────────
export const listSalesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),

  cashier: z.string().optional(),

  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'startDate must be a valid date string'
    }),

  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'endDate must be a valid date string'
    }),

  paymentMethod: z.enum(['cash', 'credit', 'bank_transfer']).optional(),

  invoiceNumber: z.string().trim().optional()
})

export type ListSalesQuery = z.infer<typeof listSalesQuerySchema>

// backend/src/validators/return.validator.ts

import { z } from 'zod'

// ─────────────────────────────────────────────
// MongoDB ObjectId validator
// ─────────────────────────────────────────────
const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, {
  message: 'Invalid ID'
})

// ─────────────────────────────────────────────
// Single returned item
// ─────────────────────────────────────────────
const returnItemSchema = z.object({
  product: mongoIdSchema,

  quantityReturned: z
    .number()
    .int({
      message: 'Must be a whole number'
    })
    .min(1, {
      message: 'Quantity must be at least 1'
    })
})

// ─────────────────────────────────────────────
// Create Return Schema
// ─────────────────────────────────────────────
export const createReturnSchema = z.object({
  originalSale: mongoIdSchema,

  items: z.array(returnItemSchema).min(1, {
    message: 'Return must contain at least one item'
  }),

  reason: z
    .string()
    .min(1, {
      message: 'Return reason is required'
    })
    .min(3, {
      message: 'Reason must be at least 3 characters'
    })
    .max(300, {
      message: 'Reason cannot exceed 300 characters'
    })
    .trim(),

  refundMethod: z
    .enum(['cash', 'exchange', 'credit'], {
      message: 'Must be cash, exchange, or credit'
    })
    .default('cash')
})

export type CreateReturnInput = z.infer<typeof createReturnSchema>

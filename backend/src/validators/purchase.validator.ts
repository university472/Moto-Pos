// backend/src/validators/purchase.validator.ts
import { z } from 'zod'

const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID')

const purchaseItemSchema = z.object({
  product: mongoIdSchema,
  quantityReceived: z
    .number()
    .min(1, 'Quantity is required')
    .int('Must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  purchasePricePerUnit: z
    .number()
    .min(1, 'Purchase price is required')
    .min(0, 'Price cannot be negative'),
  // Whether to also update the product's stored purchasePrice
  updateProductPrice: z.boolean().optional().default(false)
})

export const createPurchaseSchema = z.object({
  supplier: mongoIdSchema,
  items: z
    .array(purchaseItemSchema)
    .min(1, 'Purchase must contain at least one item')
    .max(100, 'Cannot exceed 100 items per purchase entry'),
  purchaseDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date'),
  notes: z.string().max(500).trim().optional().default('')
})

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>

export const listPurchasesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
  supplier: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export type ListPurchasesQuery = z.infer<typeof listPurchasesQuerySchema>

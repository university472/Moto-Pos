// backend/src/validators/product.validator.ts

import { z } from 'zod'

// ── MongoDB ObjectId Validator ────────────────────────────────────────────
const mongoIdSchema = z
  .string()
  .trim()
  .min(1, 'ID is required')
  .regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ObjectId format')

// ── Price Number Schema ───────────────────────────────────────────────────
const priceSchema = z
  .string()
  .trim()
  .min(1, 'Value is required')
  .transform((val) => parseFloat(val))
  .refine((val) => !isNaN(val), {
    message: 'Must be a valid number'
  })
  .refine((val) => val >= 0, {
    message: 'Value cannot be negative'
  })

// ── Integer Number Schema ─────────────────────────────────────────────────
const integerSchema = z
  .string()
  .trim()
  .min(1, 'Value is required')
  .transform((val) => parseInt(val, 10))
  .refine((val) => !isNaN(val), {
    message: 'Must be a valid number'
  })
  .refine((val) => Number.isInteger(val), {
    message: 'Must be a whole number'
  })
  .refine((val) => val >= 0, {
    message: 'Value cannot be negative'
  })

// ── POST /api/v1/products ─────────────────────────────────────────────────
export const createProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Product name is required')
      .min(2, 'Product name must be at least 2 characters')
      .max(150, 'Product name cannot exceed 150 characters'),

    sku: z
      .string()
      .trim()
      .max(50, 'SKU cannot exceed 50 characters')
      .optional(),

    brand: mongoIdSchema,

    category: mongoIdSchema,

    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .optional()
      .default(''),

    purchasePrice: priceSchema.refine((val) => val >= 0, {
      message: 'Purchase price cannot be negative'
    }),

    salePrice: priceSchema.refine((val) => val >= 0, {
      message: 'Sale price cannot be negative'
    }),

    stockQty: integerSchema.refine((val) => val >= 0, {
      message: 'Stock quantity cannot be negative'
    }),

    lowStockThreshold: z
      .number()
      .int('Low stock threshold must be a whole number')
      .min(0, 'Low stock threshold cannot be negative')
      .default(5)
  })
  .refine((data) => data.salePrice >= data.purchasePrice, {
    message: 'Sale price should be greater than or equal to purchase price.',
    path: ['salePrice']
  })

export type CreateProductInput = z.infer<typeof createProductSchema>

// ── PUT /api/v1/products/:id ──────────────────────────────────────────────
export const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Product name must be at least 2 characters')
      .max(150, 'Product name cannot exceed 150 characters')
      .optional(),

    sku: z
      .string()
      .trim()
      .max(50, 'SKU cannot exceed 50 characters')
      .optional(),

    brand: mongoIdSchema.optional(),

    category: mongoIdSchema.optional(),

    description: z
      .string()
      .trim()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),

    purchasePrice: z
      .number()
      .min(0, 'Purchase price cannot be negative')
      .optional(),

    salePrice: z.number().min(0, 'Sale price cannot be negative').optional(),

    stockQty: z
      .number()
      .int('Stock quantity must be a whole number')
      .min(0, 'Stock quantity cannot be negative')
      .optional(),

    lowStockThreshold: z
      .number()
      .int('Low stock threshold must be a whole number')
      .min(0, 'Low stock threshold cannot be negative')
      .optional(),

    isActive: z.boolean().optional()
  })
  .refine(
    (data) => {
      if (data.salePrice !== undefined && data.purchasePrice !== undefined) {
        return data.salePrice >= data.purchasePrice
      }

      return true
    },
    {
      message: 'Sale price should be greater than or equal to purchase price.',
      path: ['salePrice']
    }
  )

export type UpdateProductInput = z.infer<typeof updateProductSchema>

// ── GET /api/v1/products ─────────────────────────────────────────────────
export const listProductsQuerySchema = z.object({
  q: z.string().trim().optional(),

  brand: z.string().optional(),

  category: z.string().optional(),

  minStock: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : undefined)),

  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val, 10), 100) : 20)),

  sort: z
    .enum(['name', 'price', 'stock', 'createdAt'])
    .optional()
    .default('name'),

  includeInactive: z
    .string()
    .optional()
    .transform((val) => val === 'true')
})

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>

// ── GET /api/v1/products/search ──────────────────────────────────────────
export const searchProductsQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required'),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val, 10), 20) : 10))
})

export type SearchProductsQuery = z.infer<typeof searchProductsQuerySchema>

// ── PATCH /api/v1/products/bulk-price ────────────────────────────────────
export const bulkPriceUpdateSchema = z.object({
  filterType: z.enum(['brand', 'category', 'all']),

  filterId: z.string().optional(),

  priceField: z.enum(['salePrice', 'purchasePrice']),

  adjustmentType: z.enum([
    'percentage_increase',
    'percentage_decrease',
    'set_value'
  ]),

  adjustmentValue: priceSchema
})

export type BulkPriceUpdateInput = z.infer<typeof bulkPriceUpdateSchema>

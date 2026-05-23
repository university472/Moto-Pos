// backend/src/validators/category.validator.ts
// Zod schemas for Category API request bodies.

import { z } from 'zod'

// ── POST /api/v1/categories ────────────────────────────────────────────────
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(80, 'Category name cannot exceed 80 characters')
    .trim(),
  description: z
    .string()
    .max(300, 'Description cannot exceed 300 characters')
    .trim()
    .optional()
    .default('')
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

// ── PUT /api/v1/categories/:id ────────────────────────────────────────────
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(80, 'Category name cannot exceed 80 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(300, 'Description cannot exceed 300 characters')
    .trim()
    .optional()
})

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

// ── Query params for GET /api/v1/categories ───────────────────────────────
export const listCategoriesQuerySchema = z.object({
  includeInactive: z
    .string()
    .optional()
    .transform((val) => val === 'true')
})

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>

// backend/src/validators/brand.validator.ts

import { z } from 'zod'

// ── POST /api/v1/brands ───────────────────────────────────────────────────
export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Brand name is required')
    .min(2, 'Brand name must be at least 2 characters')
    .max(50, 'Brand name cannot exceed 50 characters')
})

export type CreateBrandInput = z.infer<typeof createBrandSchema>

// ── PUT /api/v1/brands/:id ────────────────────────────────────────────────
export const updateBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Brand name is required')
    .min(2, 'Brand name must be at least 2 characters')
    .max(50, 'Brand name cannot exceed 50 characters')
})

export type UpdateBrandInput = z.infer<typeof updateBrandSchema>

// ── Query params for GET /api/v1/brands ───────────────────────────────────
export const listBrandsQuerySchema = z.object({
  includeInactive: z
    .string()
    .optional()
    .transform((val) => val === 'true')
})

export type ListBrandsQuery = z.infer<typeof listBrandsQuerySchema>

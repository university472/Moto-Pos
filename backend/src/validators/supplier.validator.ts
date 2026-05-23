// backend/src/validators/supplier.validator.ts
import { z } from 'zod'

const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID')

export const createSupplierSchema = z.object({
  name: z
    .string()
    .min(1, 'Supplier name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  contactPerson: z.string().max(80).trim().optional().default(''),
  phone: z.string().max(30).trim().optional().default(''),
  address: z.string().max(300).trim().optional().default(''),
  brands: z.array(mongoIdSchema).optional().default([]),
  notes: z.string().max(500).trim().optional().default('')
})

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>

export const updateSupplierSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  contactPerson: z.string().max(80).trim().optional(),
  phone: z.string().max(30).trim().optional(),
  address: z.string().max(300).trim().optional(),
  brands: z.array(mongoIdSchema).optional(),
  notes: z.string().max(500).trim().optional(),
  isActive: z.boolean().optional()
})

export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>

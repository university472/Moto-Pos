// backend/src/validators/auth.validator.ts

import { z } from 'zod'

// ── POST /api/v1/auth/login ───────────────────────────────────────────────
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').toLowerCase().trim(),

  password: z.string().min(1, 'Password is required')
})

export type LoginInput = z.infer<typeof loginSchema>

// ── POST /api/v1/users (create user — admin only) ────────────────────────
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .toLowerCase()
    .trim()
    .regex(
      /^[a-z0-9_]+$/,
      'Username can only contain lowercase letters, numbers, and underscores'
    ),

  password: z.string().min(6, 'Password must be at least 6 characters'),

  role: z.enum(['admin', 'cashier'], {
    message: 'Role must be either admin or cashier'
  })
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// ── PATCH /api/v1/users/:id/password ─────────────────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),

    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),

    confirmPassword: z.string().min(1, 'Please confirm your new password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmPassword']
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ── PUT /api/v1/users/:id (update user details) ───────────────────────────
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim()
    .optional(),

  role: z
    .enum(['admin', 'cashier'], {
      message: 'Role must be either admin or cashier'
    })
    .optional(),

  isActive: z.boolean().optional()
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

// backend/src/types/auth.types.ts
// Shared TypeScript interfaces for the auth system.
// These extend Express's Request so req.user is fully typed everywhere.

import { Request } from 'express'
import { Types } from 'mongoose'

// ── User roles (matches Section 8 schema) ────────────────────────────────
export type UserRole = 'admin' | 'cashier'

// ── What gets embedded inside the JWT access token ───────────────────────
export interface JwtAccessPayload {
  userId: string
  role: UserRole
  name: string
}

// ── What gets embedded inside the JWT refresh token ──────────────────────
export interface JwtRefreshPayload {
  userId: string
}

// ── Lean user object returned from DB (no password) ──────────────────────
export interface SafeUser {
  _id: Types.ObjectId
  name: string
  username: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ── Extend Express Request so req.user is typed in every controller ───────
export interface AuthenticatedRequest extends Request {
  user: JwtAccessPayload
}

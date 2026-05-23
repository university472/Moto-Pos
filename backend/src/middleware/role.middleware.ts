// backend/src/middleware/role.middleware.ts
// Role enforcement middleware — used AFTER verifyToken.
// requireAdmin: blocks cashiers from admin-only routes.
// requireCashier: allows both cashier and admin (all authenticated users).

import { Response, NextFunction } from 'express'
import { AuthenticatedRequest, UserRole } from '../types/auth.types'
import { AppError } from './error.middleware'

// ── Only admin can access ─────────────────────────────────────────────────
// Usage: router.post("/brands", verifyToken, requireAdmin, brandController.create)
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new AppError('Authentication required.', 401))
    return
  }

  if (req.user.role !== 'admin') {
    next(
      new AppError('Access denied. This action requires admin privileges.', 403)
    )
    return
  }

  next()
}

// ── Both admin and cashier can access ────────────────────────────────────
// Usage: router.get("/products", verifyToken, requireCashier, productController.list)
export function requireCashier(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new AppError('Authentication required.', 401))
    return
  }

  const allowedRoles: UserRole[] = ['admin', 'cashier']

  if (!allowedRoles.includes(req.user.role)) {
    next(
      new AppError(
        'Access denied. You do not have permission for this action.',
        403
      )
    )
    return
  }

  next()
}

// ── Generic role checker (for future flexibility) ─────────────────────────
// Usage: requireRole("admin") or requireRole("cashier")
export function requireRole(...roles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      next(new AppError('Authentication required.', 401))
      return
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}.`,
          403
        )
      )
      return
    }

    next()
  }
}

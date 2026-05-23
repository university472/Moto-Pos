// backend/src/middleware/auth.middleware.ts
// verifyToken middleware — validates JWT access token on every protected route.
// Attaches decoded user payload to req.user for downstream controllers.

import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AuthenticatedRequest, JwtAccessPayload } from '../types/auth.types'
import { AppError } from './error.middleware'

export async function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // ── Extract token from Authorization header ────────────────────────
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Access denied. No token provided. Please log in.',
        401
      )
    }

    const token = authHeader.split(' ')[1]

    if (!token || token === 'undefined' || token === 'null') {
      throw new AppError(
        'Access denied. Invalid token format. Please log in again.',
        401
      )
    }

    // ── Verify and decode the JWT ──────────────────────────────────────
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtAccessPayload

    // ── Attach user payload to request for downstream use ─────────────
    // Controllers access: req.user.userId, req.user.role, req.user.name
    req.user = decoded

    next()
  } catch (error) {
    // Handle specific JWT errors with helpful messages
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Your session has expired. Please log in again.', 401))
      return
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(
        new AppError('Invalid authentication token. Please log in again.', 401)
      )
      return
    }

    next(error)
  }
}

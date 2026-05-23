// backend/src/middleware/error.middleware.ts
// Global error handler — catches ALL unhandled errors from controllers/services.
// Every error response follows the standard API format from the spec.

import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

// Standard API error class — throw this from any controller
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// 404 handler — mount BEFORE globalErrorHandler
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
    error: 'NOT_FOUND'
  })
}

// Global error handler — mount LAST in app.ts
export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, error.message)

  // Zod validation error (from validators)
  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors
    res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your input.',
      data: null,
      error: fieldErrors
    })
    return
  }

  // Our own AppError (thrown intentionally from controllers)
  if (error instanceof AppError && error.isOperational) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: null,
      error: error.message
    })
    return
  }

  // Mongoose duplicate key error (e.g., duplicate username or SKU)
  if ((error as NodeJS.ErrnoException).name === 'MongoServerError') {
    const mongoError = error as {
      code?: number
      keyValue?: Record<string, unknown>
    }
    if (mongoError.code === 11000) {
      const duplicateField = Object.keys(mongoError.keyValue || {})[0]
      res.status(409).json({
        success: false,
        message: `A record with this ${duplicateField} already exists.`,
        data: null,
        error: 'DUPLICATE_KEY'
      })
      return
    }
  }

  // Mongoose CastError (invalid ObjectId in URL param)
  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format provided.',
      data: null,
      error: 'INVALID_ID'
    })
    return
  }

  // Mongoose ValidationError (schema-level validation)
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null,
      error: 'MONGOOSE_VALIDATION_ERROR'
    })
    return
  }

  // Unknown / unexpected error — don't leak internals in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred. Please try again.',
    data: null,
    error: isDevelopment ? error.message : 'INTERNAL_SERVER_ERROR'
  })
}

// backend/src/middleware/validate.middleware.ts
// Wraps Zod schemas into Express middleware.
// Usage: router.post('/brands', validate(createBrandSchema), brandController.create)

import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and replace req.body with the validated + typed result
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
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
      next(error)
    }
  }
}

// Validates query params (for GET requests with filters)
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as typeof req.query
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.flatten().fieldErrors
        res.status(400).json({
          success: false,
          message: 'Invalid query parameters.',
          data: null,
          error: fieldErrors
        })
        return
      }
      next(error)
    }
  }
}

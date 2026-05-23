// backend/src/routes/categories.routes.ts
// Category route definitions — same pattern as brands routes.

import { Router, RequestHandler } from 'express'
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categories.controller'
import { verifyToken } from '../middleware/auth.middleware'
import { requireAdmin, requireCashier } from '../middleware/role.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createCategorySchema,
  updateCategorySchema
} from '../validators/category.validator'

const router: Router = Router()

// All category routes require a valid JWT
router.use(verifyToken as RequestHandler)

// ── GET /api/v1/categories ─────────────────────────────────────────────────
router.get(
  '/',
  requireCashier as RequestHandler,
  listCategories as RequestHandler
)

// ── GET /api/v1/categories/:id ─────────────────────────────────────────────
router.get(
  '/:id',
  requireCashier as RequestHandler,
  getCategoryById as RequestHandler
)

// ── POST /api/v1/categories ────────────────────────────────────────────────
router.post(
  '/',
  requireAdmin as RequestHandler,
  validate(createCategorySchema),
  createCategory as RequestHandler
)

// ── PUT /api/v1/categories/:id ─────────────────────────────────────────────
router.put(
  '/:id',
  requireAdmin as RequestHandler,
  validate(updateCategorySchema),
  updateCategory as RequestHandler
)

// ── DELETE /api/v1/categories/:id ─────────────────────────────────────────
router.delete(
  '/:id',
  requireAdmin as RequestHandler,
  deleteCategory as RequestHandler
)

export default router

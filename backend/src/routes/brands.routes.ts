// backend/src/routes/brands.routes.ts
// Brand route definitions — maps HTTP verbs to controller functions.
// verifyToken applied to all. requireAdmin on write operations.

import { Router, RequestHandler } from 'express'
import {
  listBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
} from '../controllers/brands.controller'
import { verifyToken } from '../middleware/auth.middleware'
import { requireAdmin, requireCashier } from '../middleware/role.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createBrandSchema,
  updateBrandSchema
} from '../validators/brand.validator'

const router: Router = Router()

// All brand routes require a valid JWT
router.use(verifyToken as RequestHandler)

// ── GET /api/v1/brands ─────────────────────────────────────────────────────
// Cashier + Admin: needed for product dropdowns in POS and admin forms
router.get('/', requireCashier as RequestHandler, listBrands as RequestHandler)

// ── GET /api/v1/brands/:id ─────────────────────────────────────────────────
router.get(
  '/:id',
  requireCashier as RequestHandler,
  getBrandById as RequestHandler
)

// ── POST /api/v1/brands ────────────────────────────────────────────────────
// Admin only: validate body then create
router.post(
  '/',
  requireAdmin as RequestHandler,
  validate(createBrandSchema),
  createBrand as RequestHandler
)

// ── PUT /api/v1/brands/:id ─────────────────────────────────────────────────
router.put(
  '/:id',
  requireAdmin as RequestHandler,
  validate(updateBrandSchema),
  updateBrand as RequestHandler
)

// ── DELETE /api/v1/brands/:id ──────────────────────────────────────────────
router.delete(
  '/:id',
  requireAdmin as RequestHandler,
  deleteBrand as RequestHandler
)

export default router

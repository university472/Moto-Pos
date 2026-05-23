// backend/src/routes/products.routes.ts
// Product routes — IMPORTANT: static routes (/search, /low-stock, /bulk-price)
// must be defined BEFORE the /:id dynamic route, or Express will match them wrong.

import { Router, RequestHandler } from 'express'
import {
  listProducts,
  searchProducts,
  getLowStockProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkPriceUpdate
} from '../controllers/products.controller'
import { verifyToken } from '../middleware/auth.middleware'
import { requireAdmin, requireCashier } from '../middleware/role.middleware'
import { validate, validateQuery } from '../middleware/validate.middleware'
import {
  createProductSchema,
  updateProductSchema,
  searchProductsQuerySchema,
  bulkPriceUpdateSchema
} from '../validators/product.validator'

const router: Router = Router()

// All product routes require a valid JWT
router.use(verifyToken as RequestHandler)

// ── Static routes FIRST (before /:id) ─────────────────────────────────────

// GET /api/v1/products/search?q=  — POS search (cashier + admin)
router.get(
  '/search',
  requireCashier as RequestHandler,
  validateQuery(searchProductsQuerySchema),
  searchProducts as RequestHandler
)

// GET /api/v1/products/low-stock  — admin dashboard widget
router.get(
  '/low-stock',
  requireAdmin as RequestHandler,
  getLowStockProducts as RequestHandler
)

// PATCH /api/v1/products/bulk-price  — admin bulk update
router.patch(
  '/bulk-price',
  requireAdmin as RequestHandler,
  validate(bulkPriceUpdateSchema),
  bulkPriceUpdate as RequestHandler
)

// ── Collection routes ──────────────────────────────────────────────────────

// GET /api/v1/products  — list with filters + pagination
router.get(
  '/',
  requireCashier as RequestHandler,
  listProducts as RequestHandler
)

// POST /api/v1/products  — create product (admin only)
router.post(
  '/',
  requireAdmin as RequestHandler,
  validate(createProductSchema),
  createProduct as RequestHandler
)

// ── Dynamic :id routes LAST ────────────────────────────────────────────────

// GET /api/v1/products/:id
router.get(
  '/:id',
  requireCashier as RequestHandler,
  getProductById as RequestHandler
)

// PUT /api/v1/products/:id
router.put(
  '/:id',
  requireAdmin as RequestHandler,
  validate(updateProductSchema),
  updateProduct as RequestHandler
)

// DELETE /api/v1/products/:id (soft delete)
router.delete(
  '/:id',
  requireAdmin as RequestHandler,
  deleteProduct as RequestHandler
)

export default router

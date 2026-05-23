// backend/src/routes/sales.routes.ts
// Sale routes — IMPORTANT: static routes before /:id dynamic route.
// saleLimiter applied to POST only (prevents double-click double billing).

import { Router, RequestHandler } from 'express'
import {
  createSale,
  listSales,
  getSaleById,
  getSaleByInvoiceNumber,
  getTodaySummary,
  voidSale
} from '../controllers/sales.controller'

import { verifyToken } from '../middleware/auth.middleware'
import { requireAdmin, requireCashier } from '../middleware/role.middleware'
import { validate, validateQuery } from '../middleware/validate.middleware'
import { saleLimiter } from '../middleware/rateLimiter.middleware'

import {
  createSaleSchema,
  listSalesQuerySchema
} from '../validators/sale.validator'

const router: Router = Router()

// All sale routes require valid JWT
router.use(verifyToken as RequestHandler)

// ── Static routes FIRST ────────────────────────────────────────────────────

// GET /api/v1/sales/today-summary  — admin dashboard widget
router.get(
  '/today-summary',
  requireAdmin as RequestHandler,
  getTodaySummary as RequestHandler
)

// GET /api/v1/sales/invoice/:invoiceNumber  — fetch by INV number (reprint)
router.get(
  '/invoice/:invoiceNumber',
  requireCashier as RequestHandler,
  getSaleByInvoiceNumber as RequestHandler
)

// ── Collection routes ──────────────────────────────────────────────────────

// GET /api/v1/sales  — list with date filter + pagination (admin only)
router.get(
  '/',
  requireAdmin as RequestHandler,
  validateQuery(listSalesQuerySchema),
  listSales as RequestHandler
)

// POST /api/v1/sales  — create sale (cashier + admin, rate limited)
router.post(
  '/',
  requireCashier as RequestHandler,
  saleLimiter, // Max 30 sales/minute — prevents double-click
  validate(createSaleSchema),
  createSale as RequestHandler
)

// ── Void sale route (MUST come before /:id) ───────────────────────────────

// POST /api/v1/sales/:id/void
router.post(
  '/:id/void',
  requireAdmin as RequestHandler,
  voidSale as RequestHandler
)

// ── Dynamic :id route LAST ─────────────────────────────────────────────────

// GET /api/v1/sales/:id  — get sale by ObjectId (cashier + admin)
router.get(
  '/:id',
  requireCashier as RequestHandler,
  getSaleById as RequestHandler
)

export default router

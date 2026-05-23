// backend/src/routes/purchases.routes.ts

import { Router, RequestHandler } from 'express'

import {
  createPurchase,
  listPurchases,
  getPurchaseById,
  voidPurchase
} from '../controllers/purchases.controller'

import { verifyToken } from '../middleware/auth.middleware'

import { requireAdmin, requireCashier } from '../middleware/role.middleware'

import { validate } from '../middleware/validate.middleware'

import { createPurchaseSchema } from '../validators/purchase.validator'

const router: Router = Router()

// All routes require authentication
router.use(verifyToken as RequestHandler)

// ─────────────────────────────────────────────
// Collection Routes
// ─────────────────────────────────────────────

// GET /api/v1/purchases
router.get(
  '/',
  requireCashier as RequestHandler,
  listPurchases as RequestHandler
)

// POST /api/v1/purchases
router.post(
  '/',
  requireAdmin as RequestHandler,
  validate(createPurchaseSchema),
  createPurchase as RequestHandler
)

// ─────────────────────────────────────────────
// Dynamic Routes
// ─────────────────────────────────────────────

// GET /api/v1/purchases/:id
router.get(
  '/:id',
  requireCashier as RequestHandler,
  getPurchaseById as RequestHandler
)

// DELETE /api/v1/purchases/:id
// Void purchase + reverse stock
router.delete(
  '/:id',
  requireAdmin as RequestHandler,
  voidPurchase as RequestHandler
)

export default router

// backend/src/routes/users.routes.ts
// User management routes — all admin-only except password change (own account).

import { Router, RequestHandler } from 'express'
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  changePassword,
  reactivateUser
} from '../controllers/users.controller'

import { verifyToken } from '../middleware/auth.middleware'
import { requireAdmin, requireCashier } from '../middleware/role.middleware'
import { validate } from '../middleware/validate.middleware'

import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema
} from '../validators/auth.validator'

const router: Router = Router()

// All routes require valid JWT
router.use(verifyToken as RequestHandler)

// ── Static routes before /:id ─────────────────────────────────────────────

// GET /api/v1/users — list all users
router.get('/', requireAdmin as RequestHandler, listUsers as RequestHandler)

// POST /api/v1/users — create new user
router.post(
  '/',
  requireAdmin as RequestHandler,
  validate(createUserSchema),
  createUser as RequestHandler
)

// ── Dynamic :id routes ────────────────────────────────────────────────────

// GET /api/v1/users/:id
router.get(
  '/:id',
  requireAdmin as RequestHandler,
  getUserById as RequestHandler
)

// PUT /api/v1/users/:id — update name/role/isActive
router.put(
  '/:id',
  requireAdmin as RequestHandler,
  validate(updateUserSchema),
  updateUser as RequestHandler
)

// DELETE /api/v1/users/:id — soft deactivate
router.delete(
  '/:id',
  requireAdmin as RequestHandler,
  deactivateUser as RequestHandler
)

// PATCH /api/v1/users/:id/password
// - Cashier → can change ONLY own password
// - Admin → can change ANY user's password
router.patch(
  '/:id/password',
  requireCashier as RequestHandler,
  validate(changePasswordSchema),
  changePassword as RequestHandler
)

// PATCH /api/v1/users/:id/reactivate — re-enable deactivated account
router.patch(
  '/:id/reactivate',
  requireAdmin as RequestHandler,
  reactivateUser as RequestHandler
)

export default router

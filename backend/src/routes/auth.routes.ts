// backend/src/routes/auth.routes.ts
// Auth route definitions — maps HTTP methods + paths to controller functions.
// Public routes: /login (no JWT needed)
// Protected routes: /logout, /refresh, /me (JWT required)

import { Router } from 'express'
import {
  login,
  logout,
  refreshAccessToken,
  getMe
} from '../controllers/auth.controller'
import { verifyToken } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { loginSchema } from '../validators/auth.validator'

// Cast to unknown first to allow mixed authenticated/public routes
// Individual controllers handle their own AuthenticatedRequest typing
import { RequestHandler } from 'express'

const router: Router = Router()

// ── Public routes (no JWT needed) ────────────────────────────────────────

// POST /api/v1/auth/login
// Rate-limited at app.ts level with loginLimiter
router.post(
  '/login',
  validate(loginSchema), // Validate body before hitting controller
  login as RequestHandler
)

// POST /api/v1/auth/refresh
// Uses httpOnly cookie — no body needed
router.post('/refresh', refreshAccessToken as RequestHandler)

// ── Protected routes (JWT required) ──────────────────────────────────────

// POST /api/v1/auth/logout
router.post('/logout', verifyToken as RequestHandler, logout as RequestHandler)

// GET /api/v1/auth/me
router.get('/me', verifyToken as RequestHandler, getMe as RequestHandler)

export default router

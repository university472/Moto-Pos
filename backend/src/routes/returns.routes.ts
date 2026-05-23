// backend/src/routes/returns.routes.ts
import { Router, RequestHandler } from 'express'
import {
  listReturns,
  getReturnById,
  processReturn
} from '../controllers/returns.controller'
import { verifyToken } from '../middleware/auth.middleware'
import { requireAdmin, requireCashier } from '../middleware/role.middleware'
import { validate } from '../middleware/validate.middleware'
import { createReturnSchema } from '../validators/return.validator'

const router: Router = Router()
router.use(verifyToken as RequestHandler)

router.get('/', requireAdmin as RequestHandler, listReturns as RequestHandler)
router.post(
  '/',
  requireCashier as RequestHandler,
  validate(createReturnSchema),
  processReturn as RequestHandler
)
router.get(
  '/:id',
  requireCashier as RequestHandler,
  getReturnById as RequestHandler
)

export default router

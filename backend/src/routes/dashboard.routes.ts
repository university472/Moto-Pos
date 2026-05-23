// backend/src/routes/dashboard.routes.ts
import { Router, RequestHandler } from 'express'
import {
  getDashboardStats,
  getTopProductsToday,
  getSalesChartData
} from '../controllers/dashboard.controller'
import { verifyToken } from '../middleware/auth.middleware'
import { requireAdmin } from '../middleware/role.middleware'

const router:Router = Router()
router.use(verifyToken as RequestHandler)
router.use(requireAdmin as RequestHandler)

router.get('/stats', getDashboardStats as RequestHandler)
router.get('/top-today', getTopProductsToday as RequestHandler)
router.get('/chart', getSalesChartData as RequestHandler)

export default router

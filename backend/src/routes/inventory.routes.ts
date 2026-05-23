// backend/src/routes/inventory.routes.ts
// Static routes BEFORE :productId dynamic route
import { Router, RequestHandler } from 'express'
import {
  getInventorySummary,
  getLowStockInventory,
  getStockHistory
} from '../controllers/inventory.controller'
import { verifyToken } from '../middleware/auth.middleware'
import { requireAdmin } from '../middleware/role.middleware'

const router: Router = Router()
router.use(verifyToken as RequestHandler)
router.use(requireAdmin as RequestHandler)

router.get('/summary', getInventorySummary as RequestHandler)
router.get('/low-stock', getLowStockInventory as RequestHandler)
router.get('/:productId/history', getStockHistory as RequestHandler)

export default router

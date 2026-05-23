// backend/src/routes/suppliers.routes.ts
import { Router, RequestHandler } from 'express'
import {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controllers/suppliers.controller'
import { verifyToken } from '../middleware/auth.middleware'
import { requireAdmin } from '../middleware/role.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createSupplierSchema,
  updateSupplierSchema
} from '../validators/supplier.validator'

const router: Router = Router()
router.use(verifyToken as RequestHandler)
router.use(requireAdmin as RequestHandler) // All supplier routes: admin only

router.get('/', listSuppliers as RequestHandler)
router.get('/:id', getSupplierById as RequestHandler)
router.post(
  '/',
  validate(createSupplierSchema),
  createSupplier as RequestHandler
)
router.put(
  '/:id',
  validate(updateSupplierSchema),
  updateSupplier as RequestHandler
)
router.delete('/:id', deleteSupplier as RequestHandler)

export default router

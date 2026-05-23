// backend/src/routes/settings.routes.ts

import { Router } from 'express'

const router: Router = Router()

// Example route
router.get('/', async (_req, res) => {
  res.json({
    success: true,
    message: 'Settings route working'
  })
})

export default router

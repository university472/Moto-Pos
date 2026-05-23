// // import express, { Application } from 'express'
// // import cors from 'cors'
// // import helmet from 'helmet'
// // import morgan from 'morgan'
// // import cookieParser from 'cookie-parser'
// // import { env } from './config/env'
// // import {
// //   generalLimiter,
// //   loginLimiter
// // } from './middleware/rateLimiter.middleware'
// // import {
// //   notFoundHandler,
// //   globalErrorHandler
// // } from './middleware/error.middleware'

// // import authRoutes from './routes/auth.routes'
// // import userRoutes from './routes/users.routes'
// // import brandRoutes from './routes/brands.routes'
// // import categoryRoutes from './routes/categories.routes'
// // import productRoutes from './routes/products.routes'
// // import saleRoutes from './routes/sales.routes'
// // import supplierRoutes from './routes/suppliers.routes'
// // import purchaseRoutes from './routes/purchases.routes'
// // import returnRoutes from './routes/returns.routes'
// // import inventoryRoutes from './routes/inventory.routes'
// // import dashboardRoutes from './routes/dashboard.routes'
// // import reportRoutes from './routes/reports.routes'
// // import settingsRoutes from './routes/settings.routes'

// // const app: Application = express()

// // // ── 1. CORS MUST come before helmet and everything else ───────────────────
// // const corsOptions = {
// //   origin: function (
// //     origin: string | undefined,
// //     callback: (err: Error | null, allow?: boolean) => void
// //   ) {
// //     const allowed = [
// //       'http://localhost:3000',
// //       'http://192.168.56.1:3000',
// //       'http://10.76.45.166:3000'
// //     ]
// //     // Allow requests with no origin (e.g. curl, Postman)
// //     if (!origin || allowed.includes(origin)) {
// //       callback(null, true)
// //     } else {
// //       callback(new Error(`CORS blocked: ${origin}`))
// //     }
// //   },
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization'],
// //   optionsSuccessStatus: 200
// // }

// // app.use(cors(corsOptions))

// // // ── 2. Handle preflight OPTIONS requests explicitly ───────────────────────
// // app.options('/(.*)', cors(corsOptions))

// // // ── 3. Helmet after CORS ──────────────────────────────────────────────────
// // app.use(
// //   helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false })
// // )

// // app.use(express.json({ limit: '10mb' }))
// // app.use(express.urlencoded({ extended: true, limit: '10mb' }))
// // app.use(cookieParser())
// // if (env.NODE_ENV === 'development') app.use(morgan('dev'))
// // app.use('/api', generalLimiter)

// // app.get('/health', (_req, res) => {
// //   res.status(200).json({
// //     success: true,
// //     message: 'Moto POS API is running',
// //     data: {
// //       environment: env.NODE_ENV,
// //       timestamp: new Date().toISOString(),
// //       version: '1.0.0'
// //     },
// //     error: null
// //   })
// // })

// // app.use('/api/v1/auth', loginLimiter, authRoutes)
// // app.use('/api/v1/users', userRoutes)
// // app.use('/api/v1/brands', brandRoutes)
// // app.use('/api/v1/categories', categoryRoutes)
// // app.use('/api/v1/products', productRoutes)
// // app.use('/api/v1/sales', saleRoutes)
// // app.use('/api/v1/suppliers', supplierRoutes)
// // app.use('/api/v1/purchases', purchaseRoutes)
// // app.use('/api/v1/returns', returnRoutes)
// // app.use('/api/v1/inventory', inventoryRoutes)
// // app.use('/api/v1/dashboard', dashboardRoutes)
// // app.use('/api/v1/reports', reportRoutes)
// // app.use('/api/v1/settings', settingsRoutes)

// // app.use(notFoundHandler)
// // app.use(globalErrorHandler)

// // export default app

// import express, { Application } from 'express'
// import cors from 'cors'
// import helmet from 'helmet'
// import morgan from 'morgan'
// import cookieParser from 'cookie-parser'
// import { env } from './config/env'
// import {
//   generalLimiter,
//   loginLimiter
// } from './middleware/rateLimiter.middleware'
// import {
//   notFoundHandler,
//   globalErrorHandler
// } from './middleware/error.middleware'

// import authRoutes from './routes/auth.routes'
// import userRoutes from './routes/users.routes'
// import brandRoutes from './routes/brands.routes'
// import categoryRoutes from './routes/categories.routes'
// import productRoutes from './routes/products.routes'
// import saleRoutes from './routes/sales.routes'
// import supplierRoutes from './routes/suppliers.routes'
// import purchaseRoutes from './routes/purchases.routes'
// import returnRoutes from './routes/returns.routes'
// import inventoryRoutes from './routes/inventory.routes'
// import dashboardRoutes from './routes/dashboard.routes'
// import reportRoutes from './routes/reports.routes'
// import settingsRoutes from './routes/settings.routes'

// const app: Application = express()

// const corsOptions = {
//   origin: function (
//     origin: string | undefined,
//     callback: (err: Error | null, allow?: boolean) => void
//   ) {
//     const allowed = [
//       'http://localhost:3000',
//       'http://192.168.56.1:3000',
//       'http://10.76.45.166:3000'
//     ]
//     if (!origin || allowed.includes(origin)) {
//       callback(null, true)
//     } else {
//       callback(new Error(`CORS blocked: ${origin}`))
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   optionsSuccessStatus: 200
// }

// // 1. CORS before everything
// app.use(cors(corsOptions))

// // 2. Helmet after CORS
// app.use(
//   helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false })
// )

// app.use(express.json({ limit: '10mb' }))
// app.use(express.urlencoded({ extended: true, limit: '10mb' }))
// app.use(cookieParser())
// if (env.NODE_ENV === 'development') app.use(morgan('dev'))
// app.use('/api', generalLimiter)

// app.get('/health', (_req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'Moto POS API is running',
//     data: {
//       environment: env.NODE_ENV,
//       timestamp: new Date().toISOString(),
//       version: '1.0.0'
//     },
//     error: null
//   })
// })

// app.use('/api/v1/auth', loginLimiter, authRoutes)
// app.use('/api/v1/users', userRoutes)
// app.use('/api/v1/brands', brandRoutes)
// app.use('/api/v1/categories', categoryRoutes)
// app.use('/api/v1/products', productRoutes)
// app.use('/api/v1/sales', saleRoutes)
// app.use('/api/v1/suppliers', supplierRoutes)
// app.use('/api/v1/purchases', purchaseRoutes)
// app.use('/api/v1/returns', returnRoutes)
// app.use('/api/v1/inventory', inventoryRoutes)
// app.use('/api/v1/dashboard', dashboardRoutes)
// app.use('/api/v1/reports', reportRoutes)
// app.use('/api/v1/settings', settingsRoutes)

// app.use(notFoundHandler)
// app.use(globalErrorHandler)

// export default app

import express, { Application, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import {
  generalLimiter,
  loginLimiter
} from './middleware/rateLimiter.middleware'
import {
  notFoundHandler,
  globalErrorHandler
} from './middleware/error.middleware'

import authRoutes from './routes/auth.routes'
import userRoutes from './routes/users.routes'
import brandRoutes from './routes/brands.routes'
import categoryRoutes from './routes/categories.routes'
import productRoutes from './routes/products.routes'
import saleRoutes from './routes/sales.routes'
import supplierRoutes from './routes/suppliers.routes'
import purchaseRoutes from './routes/purchases.routes'
import returnRoutes from './routes/returns.routes'
import inventoryRoutes from './routes/inventory.routes'
import dashboardRoutes from './routes/dashboard.routes'
import reportRoutes from './routes/reports.routes'
import settingsRoutes from './routes/settings.routes'

const app: Application = express()

// ── STEP 1: Manual CORS middleware (replaces cors package) ────────────────
// This is the most reliable approach — no external package quirks.
// Handles ALL origins in development mode.

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined

  if (env.NODE_ENV === 'development') {
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*')
    }
  } else {
    const allowedOrigins = ['http://localhost:3000', env.FRONTEND_URL]
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  )
  // ✅ FIX: Add Cache-Control and Pragma
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma'
  )
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  next()
})
// ── STEP 2: Security + parsing middleware ─────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

if (env.NODE_ENV === 'development') app.use(morgan('dev'))
app.use('/api', generalLimiter)

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Moto POS API is running',
    data: {
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    },
    error: null
  })
})

// ── All routes ────────────────────────────────────────────────────────────
app.use('/api/v1/auth', loginLimiter, authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/brands', brandRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/sales', saleRoutes)
app.use('/api/v1/suppliers', supplierRoutes)
app.use('/api/v1/purchases', purchaseRoutes)
app.use('/api/v1/returns', returnRoutes)
app.use('/api/v1/inventory', inventoryRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/reports', reportRoutes)
app.use('/api/v1/settings', settingsRoutes)

app.use(notFoundHandler)
app.use(globalErrorHandler)

export default app

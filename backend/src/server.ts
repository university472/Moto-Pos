// // backend/server.ts
// // Application entry point — connects to DB then starts the HTTP server.
// // Handles uncaught exceptions and unhandled promise rejections.

// import { connectDatabase } from './config/db'
// import { env } from './config/env'
// import app from './app'

// // Handle uncaught exceptions (synchronous errors outside async context)
// process.on('uncaughtException', (error: Error) => {
//   console.error('❌  UNCAUGHT EXCEPTION — Shutting down...')
//   console.error(error.name, error.message)
//   process.exit(1)
// })

// async function startServer(): Promise<void> {
//   try {
//     // 1. Connect to MongoDB first (server won't start if DB fails)
//     await connectDatabase()

//     // 2. Start HTTP server
//     const server = app.listen(env.PORT, '0.0.0.0', () => {
//       console.log('─────────────────────────────────────────────')
//       console.log(`🚀  Moto POS API Server started`)
//       console.log(`📍  URL:         http://localhost:${env.PORT}`)
//       console.log(`🌍  Environment: ${env.NODE_ENV}`)
//       console.log(`🏥  Health:      http://localhost:${env.PORT}/health`)
//       console.log('─────────────────────────────────────────────')
//     })

//     // Handle unhandled promise rejections (async errors not caught by try/catch)
//     process.on('unhandledRejection', (reason: unknown) => {
//       console.error('❌  UNHANDLED REJECTION — Shutting down...')
//       console.error(reason)
//       server.close(() => {
//         process.exit(1)
//       })
//     })
//   } catch (error) {
//     console.error('❌  Failed to start server:', error)
//     process.exit(1)
//   }
// }

// startServer()

import { connectDatabase } from './config/db'
import { env } from './config/env'
import app from './app'

process.on('uncaughtException', (error: Error) => {
  console.error('❌  UNCAUGHT EXCEPTION — Shutting down...')
  console.error(error.name, error.message)
  process.exit(1)
})

async function startServer(): Promise<void> {
  try {
    await connectDatabase()

    // Listen on 0.0.0.0 — accepts connections from ALL network interfaces
    // This means both localhost AND 192.168.56.1 AND 10.76.45.166 all work
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      console.log('─────────────────────────────────────────────')
      console.log(`🚀  Moto POS API Server started`)
      console.log(`📍  Local:       http://localhost:${env.PORT}`)
      console.log(`📍  Network:     http://192.168.56.1:${env.PORT}`)
      console.log(`📍  Network:     http://10.76.45.166:${env.PORT}`)
      console.log(`🌍  Environment: ${env.NODE_ENV}`)
      console.log(`🏥  Health:      http://localhost:${env.PORT}/health`)
      console.log('─────────────────────────────────────────────')
    })

    process.on('unhandledRejection', (reason: unknown) => {
      console.error('❌  UNHANDLED REJECTION — Shutting down...')
      console.error(reason)
      server.close(() => {
        process.exit(1)
      })
    })
  } catch (error) {
    console.error('❌  Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

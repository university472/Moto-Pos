// backend/src/config/db.ts
// Mongoose connection with replica set support (required for transactions).
// Logs connection status and handles graceful shutdown.

import mongoose from 'mongoose'
import { env } from './env'

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true)

    const connection = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    })

    console.log(
      `✅  MongoDB connected: ${connection.connection.host} — DB: ${connection.connection.name}`
    )

    // Log replica set status (needed for transactions)
    const adminDb = connection.connection.db?.admin()
    if (adminDb) {
      try {
        const replicaSetStatus = await adminDb.command({ replSetGetStatus: 1 })
        const primaryMember = replicaSetStatus.members?.find(
          (member: { stateStr: string }) => member.stateStr === 'PRIMARY'
        )
        if (primaryMember) {
          console.log(`✅  Replica set active — PRIMARY: ${primaryMember.name}`)
        }
      } catch {
        console.warn(
          '⚠️   Replica set not detected. MongoDB transactions will NOT work.'
        )
        console.warn('⚠️   Run: mongosh → rs.initiate() to enable replica set.')
      }
    }
  } catch (error) {
    console.error('❌  MongoDB connection failed:', error)
    process.exit(1)
  }
}

// Graceful shutdown — close DB connection when server stops
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('🔌  MongoDB connection closed on app termination.')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await mongoose.connection.close()
  console.log('🔌  MongoDB connection closed on SIGTERM.')
  process.exit(0)
})

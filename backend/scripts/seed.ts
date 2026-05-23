// backend/scripts/seed.ts
// One-time seed script — creates default users, brands, and categories.
// Run ONCE after setting up the project.

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

// ── MongoDB Connection ────────────────────────────────────────────────────
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moto-pos?replicaSet=rs0'

async function seedDatabase(): Promise<void> {
  try {
    // ── Connect to MongoDB ────────────────────────────────────────────
    await mongoose.connect(MONGODB_URI)

    console.log('✅  Connected to MongoDB for seeding')

    // ── Import Models ────────────────────────────────────────────────
    const User = (await import('../src/models/User.model')).default
    const Brand = (await import('../src/models/Brand.model')).default
    const Category = (await import('../src/models/Category.model')).default

    // ─────────────────────────────────────────────────────────────────
    // Seed Admin User
    // ─────────────────────────────────────────────────────────────────
    const existingAdmin = await User.findOne({
      username: 'admin'
    })

    if (existingAdmin) {
      console.log('⚠️   Admin user already exists — skipping user seed')
    } else {
      await User.create({
        name: 'Shop Admin',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        isActive: true
      })

      console.log('✅  Admin user created')
      console.log('    Username: admin')
      console.log('    Password: admin123')
      console.log('    ⚠️  CHANGE THIS PASSWORD after first login!')
    }

    // ─────────────────────────────────────────────────────────────────
    // Seed Cashier User
    // ─────────────────────────────────────────────────────────────────
    const existingCashier = await User.findOne({
      username: 'cashier'
    })

    if (existingCashier) {
      console.log('⚠️   Cashier user already exists — skipping cashier seed')
    } else {
      await User.create({
        name: 'Usman Ahmed',
        username: 'cashier',
        password: 'cashier123',
        role: 'cashier',
        isActive: true
      })

      console.log('✅  Cashier user created')
      console.log('    Username: cashier')
      console.log('    Password: cashier123')
      console.log('    ⚠️  CHANGE THIS PASSWORD in production!')
    }

    // ─────────────────────────────────────────────────────────────────
    // Seed Brands
    // ─────────────────────────────────────────────────────────────────
    const brandsToSeed = [
      'Honda',
      'Yamaha',
      'Suzuki',
      'United',
      'Road Prince',
      'Ravi',
      'Lifan',
      'Super Power'
    ]

    for (const brandName of brandsToSeed) {
      const exists = await Brand.findOne({
        name: brandName
      })

      if (!exists) {
        await Brand.create({
          name: brandName
        })

        console.log(`✅  Brand created: ${brandName}`)
      } else {
        console.log(`⚠️   Brand already exists: ${brandName}`)
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Seed Categories
    // ─────────────────────────────────────────────────────────────────
    const categoriesToSeed = [
      {
        name: 'Engine Parts',
        description: 'Pistons, rings, gaskets, valves, camshafts'
      },
      {
        name: 'Electrical',
        description: 'Batteries, spark plugs, CDI, indicators, wiring'
      },
      {
        name: 'Filters',
        description: 'Air filters, oil filters, fuel filters'
      },
      {
        name: 'Brakes',
        description: 'Brake pads, brake shoes, brake cables, discs'
      },
      {
        name: 'Body Parts',
        description: 'Mudguards, fuel tanks, panels, mirrors, seats'
      },
      {
        name: 'Tyres & Tubes',
        description: 'Front and rear tyres, inner tubes'
      },
      {
        name: 'Lubricants',
        description: 'Engine oil, gear oil, grease, chain lubricant'
      },
      {
        name: 'Transmission',
        description: 'Chain sprockets, clutch plates, gearbox parts'
      },
      {
        name: 'Suspension',
        description: 'Shock absorbers, fork oil, fork seals'
      },
      {
        name: 'Fuel System',
        description: 'Carburetors, fuel cocks, fuel pipes, jets'
      },
      {
        name: 'Lights',
        description: 'Headlights, tail lights, bulbs, turn signals'
      },
      {
        name: 'Accessories',
        description: 'Handlebar grips, footrests, stands, covers'
      }
    ]

    for (const catData of categoriesToSeed) {
      const exists = await Category.findOne({
        name: catData.name
      })

      if (!exists) {
        await Category.create(catData)

        console.log(`✅  Category created: ${catData.name}`)
      } else {
        console.log(`⚠️   Category already exists: ${catData.name}`)
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // Final Success Logs
    // ─────────────────────────────────────────────────────────────────
    console.log('\n─────────────────────────────────────────')
    console.log('✅  Database seeding complete!')
    console.log('─────────────────────────────────────────')
    console.log('   You can now log in at http://localhost:3000/login')
    console.log('   Admin:   admin / admin123')
    console.log('   Cashier: cashier / cashier123')
    console.log('─────────────────────────────────────────\n')
  } catch (error) {
    console.error('❌  Seeding failed:', error)

    process.exit(1)
  } finally {
    await mongoose.disconnect()

    console.log('🔌  Disconnected from MongoDB')

    process.exit(0)
  }
}

seedDatabase()

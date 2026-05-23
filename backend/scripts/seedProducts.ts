// backend/scripts/seedProducts.ts
// Seeds 20 realistic motorcycle spare parts products with correct
// brands, categories, pricing in PKR, and opening stock levels.
// Run ONCE after brands and categories are seeded.

import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moto-pos?replicaSet=rs0'

async function seedProducts(): Promise<void> {
  await mongoose.connect(MONGODB_URI)
  console.log('✅  Connected to MongoDB for product seeding')

  const User = (await import('../src/models/User.model')).default
  const Brand = (await import('../src/models/Brand.model')).default
  const Category = (await import('../src/models/Category.model')).default
  const Product = (await import('../src/models/Product.model')).default

  // Get admin user for createdBy
  const admin = await User.findOne({ role: 'admin' })
  if (!admin) {
    console.error('❌  Admin user not found. Run seed.ts first.')
    process.exit(1)
  }

  // Fetch brands and categories by name
  const getBrand = async (name: string) => {
    const brand = await Brand.findOne({ name })
    if (!brand) throw new Error(`Brand not found: ${name}. Run seed.ts first.`)
    return brand._id
  }

  const getCat = async (name: string) => {
    const cat = await Category.findOne({ name })
    if (!cat) throw new Error(`Category not found: ${name}. Run seed.ts first.`)
    return cat._id
  }

  // ── 20 test products ─────────────────────────────────────────────────────
  type ProductSeed = {
    name: string
    brand: string
    category: string
    purchasePrice: number
    salePrice: number
    stockQty: number
    lowStockThreshold: number
    description: string
  }

  const productsToSeed: ProductSeed[] = [
    // Honda Products
    {
      name: 'Honda 125 Air Filter',
      brand: 'Honda',
      category: 'Filters',
      purchasePrice: 180,
      salePrice: 280,
      stockQty: 45,
      lowStockThreshold: 8,
      description: 'Standard air filter for Honda CG125'
    },
    {
      name: 'Honda CD70 Piston Kit',
      brand: 'Honda',
      category: 'Engine Parts',
      purchasePrice: 650,
      salePrice: 950,
      stockQty: 20,
      lowStockThreshold: 5,
      description: 'Complete piston kit with rings and pin for Honda CD70'
    },
    {
      name: 'Honda 125 Spark Plug (NGK)',
      brand: 'Honda',
      category: 'Electrical',
      purchasePrice: 120,
      salePrice: 200,
      stockQty: 80,
      lowStockThreshold: 15,
      description: 'NGK spark plug for Honda CG125'
    },
    {
      name: 'Honda 125 Chain Sprocket Set',
      brand: 'Honda',
      category: 'Transmission',
      purchasePrice: 550,
      salePrice: 850,
      stockQty: 30,
      lowStockThreshold: 6,
      description: 'Front and rear sprocket with chain for Honda CG125'
    },
    {
      name: 'Honda CD70 Brake Shoe Set',
      brand: 'Honda',
      category: 'Brakes',
      purchasePrice: 200,
      salePrice: 320,
      stockQty: 35,
      lowStockThreshold: 8,
      description: 'Front and rear brake shoes for Honda CD70'
    },
    {
      name: 'Honda 125 Oil Filter',
      brand: 'Honda',
      category: 'Filters',
      purchasePrice: 80,
      salePrice: 140,
      stockQty: 60,
      lowStockThreshold: 12,
      description: 'Engine oil filter for Honda CG125'
    },
    {
      name: 'Honda 125 Headlight Assembly',
      brand: 'Honda',
      category: 'Lights',
      purchasePrice: 750,
      salePrice: 1100,
      stockQty: 12,
      lowStockThreshold: 3,
      description: 'Complete headlight assembly for Honda CG125'
    },

    // Yamaha Products
    {
      name: 'Yamaha YBR125 Air Filter',
      brand: 'Yamaha',
      category: 'Filters',
      purchasePrice: 200,
      salePrice: 320,
      stockQty: 38,
      lowStockThreshold: 8,
      description: 'Air filter element for Yamaha YBR125'
    },
    {
      name: 'Yamaha YBR125 Piston Kit',
      brand: 'Yamaha',
      category: 'Engine Parts',
      purchasePrice: 900,
      salePrice: 1350,
      stockQty: 15,
      lowStockThreshold: 4,
      description: 'STD size piston kit for Yamaha YBR125'
    },
    {
      name: 'Yamaha YBR CDI Unit',
      brand: 'Yamaha',
      category: 'Electrical',
      purchasePrice: 1200,
      salePrice: 1800,
      stockQty: 10,
      lowStockThreshold: 3,
      description: 'CDI ignition unit for Yamaha YBR125'
    },
    {
      name: 'Yamaha Fazer 150 Carburetor',
      brand: 'Yamaha',
      category: 'Fuel System',
      purchasePrice: 2500,
      salePrice: 3500,
      stockQty: 6,
      lowStockThreshold: 2,
      description: 'Complete carburetor assembly for Yamaha Fazer 150'
    },
    {
      name: 'Yamaha YBR Rear Shock Absorber',
      brand: 'Yamaha',
      category: 'Suspension',
      purchasePrice: 800,
      salePrice: 1200,
      stockQty: 18,
      lowStockThreshold: 4,
      description: 'Rear suspension shock absorber for Yamaha YBR'
    },

    // Suzuki Products
    {
      name: 'Suzuki GS150 Air Filter',
      brand: 'Suzuki',
      category: 'Filters',
      purchasePrice: 220,
      salePrice: 350,
      stockQty: 25,
      lowStockThreshold: 6,
      description: 'Air filter for Suzuki GS150'
    },
    {
      name: 'Suzuki GS150 Brake Disc Pad',
      brand: 'Suzuki',
      category: 'Brakes',
      purchasePrice: 450,
      salePrice: 700,
      stockQty: 22,
      lowStockThreshold: 5,
      description: 'Front disc brake pad set for Suzuki GS150'
    },
    {
      name: 'Suzuki GR150 Tyre Front 80/100-17',
      brand: 'Suzuki',
      category: 'Tyres & Tubes',
      purchasePrice: 1800,
      salePrice: 2600,
      stockQty: 8,
      lowStockThreshold: 2,
      description: 'Front tyre 80/100-17 for Suzuki GR150'
    },

    // Generic / Multi-brand Lubricants & Accessories
    {
      name: 'Engine Oil 20W-50 (1 Litre)',
      brand: 'United',
      category: 'Lubricants',
      purchasePrice: 450,
      salePrice: 680,
      stockQty: 100,
      lowStockThreshold: 20,
      description:
        'Mineral engine oil 20W-50, suitable for all 4-stroke motorcycles'
    },
    {
      name: 'Gear Oil 90W (500ml)',
      brand: 'United',
      category: 'Lubricants',
      purchasePrice: 180,
      salePrice: 280,
      stockQty: 70,
      lowStockThreshold: 15,
      description: 'Gear transmission oil for all motorcycles'
    },
    {
      name: 'Honda CD70 Fuel Tank',
      brand: 'Honda',
      category: 'Body Parts',
      purchasePrice: 1800,
      salePrice: 2600,
      stockQty: 5,
      lowStockThreshold: 2,
      description: 'Replacement fuel tank for Honda CD70'
    },
    {
      name: 'Motorcycle Battery 12V 5Ah',
      brand: 'Road Prince',
      category: 'Electrical',
      purchasePrice: 900,
      salePrice: 1400,
      stockQty: 20,
      lowStockThreshold: 4,
      description: 'Maintenance-free 12V battery suitable for all motorcycles'
    },
    {
      name: 'Handlebar Grip Set (Universal)',
      brand: 'Road Prince',
      category: 'Accessories',
      purchasePrice: 80,
      salePrice: 140,
      stockQty: 55,
      lowStockThreshold: 10,
      description: 'Universal rubber handlebar grips with end caps'
    }
  ]

  let created = 0
  let skipped = 0

  for (const productData of productsToSeed) {
    try {
      const brandId = await getBrand(productData.brand)
      const categoryId = await getCat(productData.category)

      const existing = await Product.findOne({
        name: productData.name,
        brand: brandId
      })

      if (existing) {
        console.log(`⚠️   Skipped (exists): ${productData.name}`)
        skipped++
        continue
      }

      await Product.create({
        name: productData.name,
        brand: brandId,
        category: categoryId,
        description: productData.description,
        purchasePrice: productData.purchasePrice,
        salePrice: productData.salePrice,
        stockQty: productData.stockQty,
        lowStockThreshold: productData.lowStockThreshold,
        createdBy: admin._id,
        isActive: true
      })

      console.log(
        `✅  Created: ${productData.name} (Rs. ${productData.salePrice})`
      )
      created++
    } catch (error) {
      console.error(
        `❌  Failed: ${productData.name} —`,
        (error as Error).message
      )
    }
  }

  console.log('\n─────────────────────────────────────────')
  console.log(`✅  Product seeding complete!`)
  console.log(`   Created: ${created} | Skipped: ${skipped}`)
  console.log('─────────────────────────────────────────\n')

  await mongoose.disconnect()
  process.exit(0)
}

seedProducts().catch((error) => {
  console.error('❌  Seeding failed:', error)
  process.exit(1)
})

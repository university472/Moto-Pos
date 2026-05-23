// backend/src/models/Product.model.ts

import mongoose, { Document, Schema, Model } from 'mongoose'

// ── TypeScript Interface ─────────────────────────────────────────────────
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId

  name: string
  sku: string

  brand: mongoose.Types.ObjectId
  category: mongoose.Types.ObjectId

  description: string

  purchasePrice: number
  salePrice: number

  stockQty: number
  lowStockThreshold: number

  isActive: boolean

  createdBy: mongoose.Types.ObjectId

  createdAt: Date
  updatedAt: Date

  // Virtuals
  isLowStock: boolean
  profitMargin: number
}

// ── Static Methods Interface ─────────────────────────────────────────────
interface IProductModel extends Model<IProduct> {
  findLowStock(): Promise<IProduct[]>
}

// ── SKU Generator ────────────────────────────────────────────────────────
function generateSku(name: string): string {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)

  const suffix = Date.now().toString().slice(-4)

  return `PRD-${prefix}-${suffix}`
}

// ── Mongoose Schema ──────────────────────────────────────────────────────
const productSchema = new Schema<IProduct, IProductModel>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [150, 'Product name cannot exceed 150 characters']
    },

    sku: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true
    },

    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand is required']
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },

    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative']
    },

    salePrice: {
      type: Number,
      required: [true, 'Sale price is required'],
      min: [0, 'Sale price cannot be negative']
    },

    stockQty: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Low stock threshold cannot be negative']
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required']
    }
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true
    },

    toObject: {
      virtuals: true
    }
  }
)

// ── Indexes ──────────────────────────────────────────────────────────────
productSchema.index(
  {
    name: 'text',
    sku: 'text'
  },
  {
    weights: {
      name: 10,
      sku: 5
    },
    name: 'product_text_search'
  }
)


productSchema.index({ brand: 1 })

productSchema.index({ category: 1 })

productSchema.index({ stockQty: 1 })

productSchema.index({
  brand: 1,
  category: 1
})

productSchema.index({ isActive: 1 })

productSchema.index({ createdAt: -1 })

// ── Virtual: isLowStock ──────────────────────────────────────────────────
productSchema.virtual('isLowStock').get(function (this: IProduct): boolean {
  return this.stockQty <= this.lowStockThreshold
})

// ── Virtual: profitMargin ────────────────────────────────────────────────
productSchema.virtual('profitMargin').get(function (this: IProduct): number {
  if (this.purchasePrice === 0) {
    return 0
  }

  return Math.round(
    ((this.salePrice - this.purchasePrice) / this.purchasePrice) * 100
  )
})

// ── Pre-save Hook ────────────────────────────────────────────────────────
productSchema.pre('save', async function () {
  if (this.isNew && !this.sku) {
    this.sku = generateSku(this.name)
  }
})

// ── Static Method ────────────────────────────────────────────────────────
productSchema.statics.findLowStock = function (): Promise<IProduct[]> {
  return this.find({
    isActive: true,

    $expr: {
      $lte: ['$stockQty', '$lowStockThreshold']
    }
  })
    .populate('brand', 'name')
    .populate('category', 'name')
    .sort({ stockQty: 1 })
    .lean()
}

// ── Model Export ─────────────────────────────────────────────────────────
const Product = mongoose.model<IProduct, IProductModel>(
  'Product',
  productSchema
)

export default Product

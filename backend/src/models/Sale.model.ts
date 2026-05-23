// backend/src/models/Sale.model.ts
// Mongoose Sale model — exact schema from Section 8 of the planning report.
// Key design decisions:
//   - Price SNAPSHOTS in each item (productName, productSku, unitPrice, purchasePrice)
//     This means even if a product is renamed or repriced, the invoice stays accurate.
//   - discountAmount is COMPUTED and stored (not recalculated on read)
//   - grandTotal is stored — never computed on the fly in reports
//   - invoiceNumber is unique and sequential: INV-YYYY-NNNNN

import mongoose, { Document, Schema, Model } from 'mongoose'

// ── Item snapshot (embedded in sale document) ─────────────────────────────
export interface ISaleItem {
  product: mongoose.Types.ObjectId
  productName: string // SNAPSHOT — name at time of sale
  productSku: string // SNAPSHOT — sku at time of sale
  quantity: number
  unitPrice: number // PKR — sale price AT TIME OF SALE
  purchasePrice: number // PKR — purchase price AT TIME OF SALE (for profit)
  subtotal: number // quantity × unitPrice
}

// ── Full sale document ────────────────────────────────────────────────────
export interface ISale extends Document {
  _id: mongoose.Types.ObjectId
  invoiceNumber: string
  cashier: mongoose.Types.ObjectId
  customerName: string
  items: ISaleItem[]
  subtotal: number
  discountType: 'percentage' | 'flat' | 'none'
  discountValue: number
  discountAmount: number
  grandTotal: number
  paymentMethod: 'cash' | 'credit' | 'bank_transfer'
  notes: string
  isReturned: boolean
  createdAt: Date
  updatedAt: Date
}

interface ISaleModel extends Model<ISale> {
  getLastInvoiceNumberForYear(year: number): Promise<ISale | null>
}

// ── Sale Item sub-schema ───────────────────────────────────────────────────
const saleItemSchema = new Schema<ISaleItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    productName: {
      type: String,
      required: [true, 'Product name snapshot is required'],
      trim: true
    },
    productSku: {
      type: String,
      required: [true, 'Product SKU snapshot is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price snapshot is required'],
      min: [0, 'Purchase price cannot be negative']
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    }
  },
  { _id: false } // No separate _id for embedded items — reduces document size
)

// ── Main Sale Schema ──────────────────────────────────────────────────────
const saleSchema = new Schema<ISale>(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      match: [
        /^INV-\d{4}-\d{5}$/,
        'Invoice number must follow format INV-YYYY-NNNNN'
      ]
    },
    cashier: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier reference is required']
    },
    customerName: {
      type: String,
      trim: true,
      maxlength: [100, 'Customer name cannot exceed 100 characters'],
      default: ''
    },
    items: {
      type: [saleItemSchema],
      required: [true, 'Sale must have at least one item'],
      validate: {
        validator: (items: ISaleItem[]) => items.length > 0,
        message: 'Sale must contain at least one item'
      }
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    discountType: {
      type: String,
      enum: {
        values: ['percentage', 'flat', 'none'],
        message: 'Discount type must be percentage, flat, or none'
      },
      default: 'none'
    },
    discountValue: {
      type: Number,
      default: 0,
      min: [0, 'Discount value cannot be negative']
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    grandTotal: {
      type: Number,
      required: [true, 'Grand total is required'],
      min: [0, 'Grand total cannot be negative']
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'credit', 'bank_transfer'],
        message: 'Payment method must be cash, credit, or bank_transfer'
      },
      default: 'cash'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
      default: ''
    },
    isReturned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// ── Indexes (exact list from Section 8 + Section 10 indexing strategy) ────
saleSchema.index({ cashier: 1 })
saleSchema.index({ createdAt: -1 }) // Date-range queries for reports
saleSchema.index({ cashier: 1, createdAt: -1 }) // Per-cashier reports
saleSchema.index({ 'items.product': 1 }) // Product sales history

// ── Static method: find last invoice for a given year ─────────────────────
// Used by invoice number generator (Section 10 exact logic)
saleSchema.statics.getLastInvoiceNumberForYear = function (
  year: number
): Promise<ISale | null> {
  const prefix = `INV-${year}-`
  return this.findOne(
    { invoiceNumber: { $regex: `^${prefix}` } },
    { invoiceNumber: 1 },
    { sort: { invoiceNumber: -1 } }
    // Lexicographic sort works correctly with zero-padded 5-digit numbers
  ).lean()
}

const Sale = mongoose.model<ISale, ISaleModel>('Sale', saleSchema)

export default Sale

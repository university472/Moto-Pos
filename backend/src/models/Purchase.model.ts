// backend/src/models/Purchase.model.ts
// Purchase model — exact schema from Section 8.
// purchaseNumber format: PUR-YYYY-NNNNN (mirrors INV- pattern).

import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IPurchaseItem {
  product: mongoose.Types.ObjectId
  productName: string // SNAPSHOT
  quantityReceived: number
  purchasePricePerUnit: number // Price paid THIS time (may differ from product's stored price)
  subtotal: number
}

export interface IPurchase extends Document {
  _id: mongoose.Types.ObjectId
  purchaseNumber: string
  supplier: mongoose.Types.ObjectId
  items: IPurchaseItem[]
  totalAmount: number
  purchaseDate: Date
  notes: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

interface IPurchaseModel extends Model<IPurchase> {
  getLastPurchaseNumberForYear(year: number): Promise<IPurchase | null>
}

const purchaseItemSchema = new Schema<IPurchaseItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: { type: String, required: true, trim: true },
    quantityReceived: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    purchasePricePerUnit: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    subtotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
)

const purchaseSchema = new Schema<IPurchase>(
  {
    purchaseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^PUR-\d{4}-\d{5}$/, 'Must follow PUR-YYYY-NNNNN format']
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required']
    },
    items: {
      type: [purchaseItemSchema],
      validate: {
        validator: (items: IPurchaseItem[]) => items.length > 0,
        message: 'Purchase must contain at least one item'
      }
    },
    totalAmount: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)


purchaseSchema.index({ supplier: 1 })
purchaseSchema.index({ purchaseDate: -1 })
purchaseSchema.index({ createdAt: -1 })

purchaseSchema.statics.getLastPurchaseNumberForYear = function (
  year: number
): Promise<IPurchase | null> {
  return this.findOne(
    { purchaseNumber: { $regex: `^PUR-${year}-` } },
    { purchaseNumber: 1 },
    { sort: { purchaseNumber: -1 } }
  ).lean()
}

const Purchase = mongoose.model<IPurchase, IPurchaseModel>(
  'Purchase',
  purchaseSchema
)

export default Purchase

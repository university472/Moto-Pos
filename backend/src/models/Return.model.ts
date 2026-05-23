// backend/src/models/Return.model.ts
// Return model — exact schema from Section 8.
// returnNumber format: RET-YYYY-NNNNN

import mongoose, { Document, Schema, Model } from 'mongoose'

export interface IReturnItem {
  product: mongoose.Types.ObjectId
  productName: string
  quantityReturned: number
  refundAmount: number // Per unit refund PKR
}

export interface IReturn extends Document {
  _id: mongoose.Types.ObjectId
  returnNumber: string
  originalSale: mongoose.Types.ObjectId
  processedBy: mongoose.Types.ObjectId
  items: IReturnItem[]
  totalRefund: number
  reason: string
  refundMethod: 'cash' | 'exchange' | 'credit'
  createdAt: Date
  updatedAt: Date
}

interface IReturnModel extends Model<IReturn> {
  getLastReturnNumberForYear(year: number): Promise<IReturn | null>
}

const returnItemSchema = new Schema<IReturnItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true, trim: true },
    quantityReturned: { type: Number, required: true, min: 1 },
    refundAmount: { type: Number, required: true, min: 0 }
  },
  { _id: false }
)

const returnSchema = new Schema<IReturn>(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^RET-\d{4}-\d{5}$/, 'Must follow RET-YYYY-NNNNN format']
    },
    originalSale: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      required: [true, 'Original sale reference is required']
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: {
      type: [returnItemSchema],
      validate: {
        validator: (items: IReturnItem[]) => items.length > 0,
        message: 'Return must contain at least one item'
      }
    },
    totalRefund: { type: Number, required: true, min: 0 },
    reason: {
      type: String,
      required: [true, 'Return reason is required'],
      trim: true,
      maxlength: [300, 'Reason cannot exceed 300 characters']
    },
    refundMethod: {
      type: String,
      enum: {
        values: ['cash', 'exchange', 'credit'],
        message: 'Invalid refund method'
      },
      default: 'cash'
    }
  },
  { timestamps: true }
)

returnSchema.index({ originalSale: 1 })
returnSchema.index({ createdAt: -1 })

returnSchema.statics.getLastReturnNumberForYear = function (
  year: number
): Promise<IReturn | null> {
  return this.findOne(
    { returnNumber: { $regex: `^RET-${year}-` } },
    { returnNumber: 1 },
    { sort: { returnNumber: -1 } }
  ).lean()
}

const Return = mongoose.model<IReturn, IReturnModel>('Return', returnSchema)
export default Return

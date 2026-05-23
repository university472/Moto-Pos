// backend/src/models/Supplier.model.ts
// Mongoose Supplier model — exact schema from Section 8.

import mongoose, { Document, Schema, Model } from 'mongoose'

export interface ISupplier extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  contactPerson: string
  phone: string
  address: string
  brands: mongoose.Types.ObjectId[]
  notes: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface ISupplierModel extends Model<ISupplier> {
  findActive(): Promise<ISupplier[]>
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    contactPerson: {
      type: String,
      trim: true,
      maxlength: [80, 'Contact person name cannot exceed 80 characters'],
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
      default: ''
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
      default: ''
    },
    brands: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Brand'
      }
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

supplierSchema.index({ name: 1 })
supplierSchema.index({ isActive: 1 })
supplierSchema.index({ brands: 1 })

supplierSchema.statics.findActive = function (): Promise<ISupplier[]> {
  return this.find({ isActive: true })
    .populate('brands', 'name')
    .sort({ name: 1 })
}

const Supplier = mongoose.model<ISupplier, ISupplierModel>(
  'Supplier',
  supplierSchema
)

export default Supplier

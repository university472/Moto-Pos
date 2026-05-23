// backend/src/models/Brand.model.ts

import mongoose, {
  Document,
  Schema,
  Model
} from 'mongoose'

// ── TypeScript Interface ──────────────────────────────────────────────────
export interface IBrand extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ── Static Methods Interface ──────────────────────────────────────────────
interface IBrandModel extends Model<IBrand> {
  findActive(): Promise<IBrand[]>
}

// ── Slug Generator Helper ─────────────────────────────────────────────────
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Mongoose Schema ───────────────────────────────────────────────────────
const brandSchema = new Schema<IBrand, IBrandModel>(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      minlength: [2, 'Brand name must be at least 2 characters'],
      maxlength: [50, 'Brand name cannot exceed 50 characters']
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────
brandSchema.index({ name: 1 }, { unique: true })
brandSchema.index({ isActive: 1 })

// ── Pre-save Hook ─────────────────────────────────────────────────────────
brandSchema.pre('save', async function () {
  if (this.isModified('name') || this.isNew) {
    this.slug = generateSlug(this.name)
  }
})

// ── Pre findOneAndUpdate Hook ─────────────────────────────────────────────
brandSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as any

  if (!update) return

  // Direct update
  if (update.name) {
    update.slug = generateSlug(update.name)
  }

  // $set update
  if (update.$set?.name) {
    update.$set.slug = generateSlug(update.$set.name)
  }
})

// ── Static Method ─────────────────────────────────────────────────────────
brandSchema.statics.findActive = function (): Promise<IBrand[]> {
  return this.find({ isActive: true }).sort({ name: 1 })
}

// ── Model Export ──────────────────────────────────────────────────────────
const Brand = mongoose.model<IBrand, IBrandModel>(
  'Brand',
  brandSchema
)

export default Brand
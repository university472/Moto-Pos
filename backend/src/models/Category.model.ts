// backend/src/models/Category.model.ts

import mongoose, { Document, Schema, Model } from 'mongoose'

// ── TypeScript Interface ──────────────────────────────────────────────────
export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ── Static Methods Interface ──────────────────────────────────────────────
interface ICategoryModel extends Model<ICategory> {
  findActive(): Promise<ICategory[]>
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
const categorySchema = new Schema<ICategory, ICategoryModel>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [80, 'Category name cannot exceed 80 characters']
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: ''
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
categorySchema.index({ name: 1 }, { unique: true })
categorySchema.index({ isActive: 1 })

// ── Pre-save Hook ─────────────────────────────────────────────────────────
categorySchema.pre('save', async function () {
  if (this.isModified('name') || this.isNew) {
    this.slug = generateSlug(this.name)
  }
})

// ── Pre findOneAndUpdate Hook ─────────────────────────────────────────────
categorySchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as any

  if (!update) return

  // Direct update
  if (update.name) {
    update.slug = generateSlug(update.name)
  }

  // Handle $set updates
  if (update.$set?.name) {
    update.$set.slug = generateSlug(update.$set.name)
  }
})

// ── Static Method ─────────────────────────────────────────────────────────
categorySchema.statics.findActive = function (): Promise<ICategory[]> {
  return this.find({ isActive: true }).sort({ name: 1 })
}

// ── Model Export ──────────────────────────────────────────────────────────
const Category = mongoose.model<ICategory, ICategoryModel>(
  'Category',
  categorySchema
)

export default Category

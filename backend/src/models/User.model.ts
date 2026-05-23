// backend/src/models/User.model.ts
// Mongoose User model — exact schema from Section 8 of the planning report.
// Includes: bcrypt password hashing (pre-save hook), password compare method.

import mongoose, { Document, Schema, Model } from 'mongoose'
import bcrypt from 'bcryptjs'
import { UserRole } from '../types/auth.types'

// ── TypeScript interface for the document ────────────────────────────────
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  username: string
  password: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Instance method — compare plain password against stored hash
  comparePassword(candidatePassword: string): Promise<boolean>
}

// ── Static methods interface ──────────────────────────────────────────────
interface IUserModel extends Model<IUser> {
  findByUsername(username: string): Promise<IUser | null>
}

// ── Mongoose Schema ───────────────────────────────────────────────────────
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [
        /^[a-z0-9_]+$/,
        'Username can only contain lowercase letters, numbers, and underscores'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // NEVER returned in queries by default — must explicitly .select("+password")
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'cashier'],
        message: 'Role must be either admin or cashier'
      },
      default: 'cashier'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true, // Auto-manages createdAt + updatedAt
    toJSON: {
      // Strip password from JSON output even if accidentally selected
      transform(_doc, returnedObject: Partial<IUser>) {
        delete returnedObject.password
        return returnedObject
      }
    }
  }
)

// ── Indexes (from Section 8) ──────────────────────────────────────────────
unique: true
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

// ── Pre-save hook: hash password before saving ────────────────────────────
// Only runs when password field is modified (not on every save)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const saltRounds = 12
  this.password = await bcrypt.hash(this.password, saltRounds)
})

// ── Instance method: compare plain password to stored hash ───────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // this.password may not be selected — handle gracefully
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// ── Static method: find active user by username ───────────────────────────
userSchema.statics.findByUsername = function (
  username: string
): Promise<IUser | null> {
  return this.findOne({
    username: username.toLowerCase(),
    isActive: true
  }).select(
    '+password' // Explicitly include password for login comparison
  )
}

const User = mongoose.model<IUser, IUserModel>('User', userSchema)

export default User

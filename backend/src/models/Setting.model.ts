// backend/src/models/Setting.model.ts

import mongoose, { Document, Model, Schema } from 'mongoose'

/* ──────────────────────────────────────────────
   INTERFACES
────────────────────────────────────────────── */

export interface ISetting extends Document {
  _id: mongoose.Types.ObjectId

  key: string

  value: unknown

  updatedAt: Date
}

export interface ISettingModel extends Model<ISetting> {
  getValue(key: string): Promise<unknown>

  setValue(key: string, value: unknown): Promise<ISetting>

  getAll(): Promise<Record<string, unknown>>
}

/* ──────────────────────────────────────────────
   SCHEMA
────────────────────────────────────────────── */

const settingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,

      required: [true, 'Setting key is required'],

      unique: true,

      trim: true,

      lowercase: true
    },

    value: {
      type: Schema.Types.Mixed,

      required: [true, 'Setting value is required']
    }
  },

  {
    timestamps: {
      createdAt: false,
      updatedAt: true
    }
  }
)

/* ──────────────────────────────────────────────
   INDEXES
────────────────────────────────────────────── */

// settingSchema.index({ key: 1 }, { unique: true })

/* ──────────────────────────────────────────────
   STATIC: GET SINGLE VALUE
────────────────────────────────────────────── */

settingSchema.statics.getValue = async function (
  key: string
): Promise<unknown> {
  const setting = await this.findOne({
    key: key.toLowerCase()
  }).lean()

  return setting?.value ?? null
}

/* ──────────────────────────────────────────────
   STATIC: UPSERT VALUE
────────────────────────────────────────────── */

settingSchema.statics.setValue = async function (
  key: string,
  value: unknown
): Promise<ISetting> {
  const setting = await this.findOneAndUpdate(
    {
      key: key.toLowerCase()
    },

    {
      $set: {
        value
      }
    },

    {
      upsert: true,
      new: true,
      runValidators: true
    }
  )

  if (!setting) {
    throw new Error('Failed to save setting')
  }

  return setting
}

/* ──────────────────────────────────────────────
   STATIC: GET ALL SETTINGS
────────────────────────────────────────────── */

settingSchema.statics.getAll = async function (): Promise<
  Record<string, unknown>
> {
  const settings = await this.find({}).lean()

  const result: Record<string, unknown> = {}

  for (const setting of settings) {
    result[setting.key] = setting.value
  }

  return result
}

/* ──────────────────────────────────────────────
   MODEL
────────────────────────────────────────────── */

const Setting =
  mongoose.models.Setting ||
  mongoose.model<ISetting, ISettingModel>('Setting', settingSchema)

export default Setting

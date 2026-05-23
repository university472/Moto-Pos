// backend/src/models/Setting.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISetting extends Document {
  key: string
  value: unknown
  createdAt: Date
  updatedAt: Date
}

interface ISettingModel extends Model<ISetting> {
  getValue(key: string): Promise<unknown>
  setValue(key: string, value: unknown): Promise<ISetting>
  getAll(): Promise<Record<string, unknown>>
}

const settingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    value: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
)

// ─────────────────────────────────────────────
// Static: Get single setting
// ─────────────────────────────────────────────
settingSchema.statics.getValue = async function (
  key: string
): Promise<unknown> {
  const setting = await this.findOne({
    key: key.toLowerCase()
  }).lean()

  return setting ? setting.value : null
}

// ─────────────────────────────────────────────
// Static: Set/update setting
// ─────────────────────────────────────────────
settingSchema.statics.setValue = async function (
  key: string,
  value: unknown
): Promise<ISetting> {
  return this.findOneAndUpdate(
    {
      key: key.toLowerCase()
    },
    {
      value
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  )
}

// ─────────────────────────────────────────────
// Static: Get all settings
// ─────────────────────────────────────────────
settingSchema.statics.getAll = async function (): Promise<
  Record<string, unknown>
> {
  const settings = await this.find().lean()

  return settings.reduce((acc: Record<string, unknown>, setting: ISetting) => {
    acc[setting.key] = setting.value
    return acc
  }, {})
}

const Setting = mongoose.model<ISetting, ISettingModel>(
  'Setting',
  settingSchema
)

export default Setting

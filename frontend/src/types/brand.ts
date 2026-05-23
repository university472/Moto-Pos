// frontend/src/types/brand.ts
// TypeScript interfaces for Brand collection — mirrors Section 8 schema.

export interface Brand {
  _id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBrandFormData {
  name: string
}

export interface UpdateBrandFormData {
  name: string
}

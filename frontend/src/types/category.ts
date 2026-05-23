// frontend/src/types/category.ts
// TypeScript interfaces for Category collection — mirrors Section 8 schema.

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryFormData {
  name: string
  description?: string
}

export interface UpdateCategoryFormData {
  name?: string
  description?: string
}

// frontend/src/types/product.ts
// TypeScript interfaces for Product collection — mirrors Section 8 schema exactly.
// All prices in PKR stored as Numbers.

import { Brand } from './brand'
import { Category } from './category'

export interface Product {
  _id: string
  name: string
  sku: string
  brand: Brand | string // Populated or just ObjectId string
  category: Category | string
  description?: string
  purchasePrice: number // PKR — what was paid to supplier
  salePrice: number // PKR — what customer pays
  stockQty: number // Current quantity in hand
  lowStockThreshold: number // Default: 5 — alert if stockQty <= this
  isActive: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

// Populated product (brand + category are objects, not IDs)
export interface PopulatedProduct extends Omit<Product, 'brand' | 'category'> {
  brand: Brand
  category: Category
}

// For POS search results — only fields needed in POS
export interface ProductSearchResult {
  _id: string
  name: string
  sku: string
  salePrice: number
  purchasePrice: number
  stockQty: number
  brand: Pick<Brand, '_id' | 'name'>
  category: Pick<Category, '_id' | 'name'>
}

// Add/Edit product form fields
export interface ProductFormData {
  name: string
  sku?: string // Optional — auto-generated if empty
  brand: string // Brand ObjectId
  category: string // Category ObjectId
  description?: string
  purchasePrice: number
  salePrice: number
  stockQty: number
  lowStockThreshold: number
}

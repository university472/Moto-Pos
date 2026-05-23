// backend/src/controllers/categories.controller.ts
// Full CRUD for categories — all 5 endpoints from Section 9.
// Same patterns as brands controller: soft delete, case-insensitive duplicate check.

import { Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Category } from '../models'
import { AppError } from '../middleware/error.middleware'
import { AuthenticatedRequest } from '../types/auth.types'
import {
  CreateCategoryInput,
  UpdateCategoryInput
} from '../validators/category.validator'

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/categories
// Role: Cashier + Admin
// ─────────────────────────────────────────────────────────────────────────
export async function listCategories(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true'

    const filter =
      includeInactive && req.user?.role === 'admin' ? {} : { isActive: true }

    const categories = await Category.find(filter).sort({ name: 1 }).lean()

    res.status(200).json({
      success: true,
      message: `${categories.length} category/categories retrieved successfully.`,
      data: { categories, total: categories.length },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/categories/:id
// Role: Cashier + Admin
// ─────────────────────────────────────────────────────────────────────────
export async function getCategoryById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid category ID format.', 400)
    }

    const category = await Category.findById(id).lean()

    if (!category) {
      throw new AppError('Category not found.', 404)
    }

    if (!category.isActive) {
      throw new AppError('This category has been deactivated.', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully.',
      data: { category },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/categories
// Role: Admin only
// ─────────────────────────────────────────────────────────────────────────
export async function createCategory(
  req: AuthenticatedRequest & { body: CreateCategoryInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, description } = req.body

    // Case-insensitive duplicate check
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    })

    if (existingCategory) {
      if (!existingCategory.isActive) {
        throw new AppError(
          `A category named "${name}" already exists but is deactivated. Please restore it instead.`,
          409
        )
      }
      throw new AppError(`A category named "${name}" already exists.`, 409)
    }

    const category = await Category.create({
      name,
      description: description ?? ''
    })

    res.status(201).json({
      success: true,
      message: `Category "${category.name}" created successfully.`,
      data: { category },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/v1/categories/:id
// Role: Admin only
// ─────────────────────────────────────────────────────────────────────────
export async function updateCategory(
  req: AuthenticatedRequest & { body: UpdateCategoryInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string
    const { name, description } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid category ID format.', 400)
    }

    // Build update object — only include provided fields
    const updateData: { name?: string; description?: string } = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description

    // Duplicate name check (only if name is being changed)
    if (name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      })

      if (existingCategory) {
        throw new AppError(
          `Another category named "${name}" already exists.`,
          409
        )
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })

    if (!updatedCategory) {
      throw new AppError('Category not found.', 404)
    }

    res.status(200).json({
      success: true,
      message: `Category "${updatedCategory.name}" updated successfully.`,
      data: { category: updatedCategory },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/categories/:id
// Role: Admin only
// SOFT DELETE — checks active products before deactivating.
// ─────────────────────────────────────────────────────────────────────────
export async function deleteCategory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid category ID format.', 400)
    }

    const category = await Category.findById(id)

    if (!category) {
      throw new AppError('Category not found.', 404)
    }

    if (!category.isActive) {
      throw new AppError('This category is already deactivated.', 400)
    }

    // Guard: check if active products use this category
    try {
      const { Product } = await import('../models')
      if (Product) {
        const activeProductCount = await Product.countDocuments({
          category: id,
          isActive: true
        })

        if (activeProductCount > 0) {
          throw new AppError(
            `Cannot deactivate "${category.name}" — it is used by ${activeProductCount} active product(s). Please reassign or deactivate those products first.`,
            409
          )
        }
      }
    } catch (importError) {
      if (importError instanceof AppError) throw importError
    }

    // Soft delete
    category.isActive = false
    await category.save()

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" has been deactivated successfully.`,
      data: null,
      error: null
    })
  } catch (error) {
    next(error)
  }
}

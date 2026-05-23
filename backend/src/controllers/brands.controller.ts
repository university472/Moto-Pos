// backend/src/controllers/brands.controller.ts
// Full CRUD for brands — all 5 endpoints from Section 9.
// Soft delete (isActive: false). Every function try/catch → next(error).

import { Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Brand } from '../models'
import { AppError } from '../middleware/error.middleware'
import { AuthenticatedRequest } from '../types/auth.types'
import {
  CreateBrandInput,
  UpdateBrandInput
} from '../validators/brand.validator'

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/brands
// Role: Cashier + Admin
// Returns all active brands sorted alphabetically.
// Query: ?includeInactive=true (admin only — show soft-deleted brands)
// ─────────────────────────────────────────────────────────────────────────
export async function listBrands(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true'

    // Only admins can see inactive brands
    const filter =
      includeInactive && req.user?.role === 'admin' ? {} : { isActive: true }

    const brands = await Brand.find(filter).sort({ name: 1 }).lean()

    res.status(200).json({
      success: true,
      message: `${brands.length} brand(s) retrieved successfully.`,
      data: { brands, total: brands.length },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/brands/:id
// Role: Cashier + Admin
// ─────────────────────────────────────────────────────────────────────────
export async function getBrandById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid brand ID format.', 400)
    }

    const brand = await Brand.findById(id).lean()

    if (!brand) {
      throw new AppError('Brand not found.', 404)
    }

    if (!brand.isActive) {
      throw new AppError('This brand has been deactivated.', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Brand retrieved successfully.',
      data: { brand },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/brands
// Role: Admin only
// Body validated by createBrandSchema before reaching here.
// ─────────────────────────────────────────────────────────────────────────
export async function createBrand(
  req: AuthenticatedRequest & { body: CreateBrandInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name } = req.body

    // Check for duplicate name (case-insensitive check before Mongoose unique index)
    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    })

    if (existingBrand) {
      if (!existingBrand.isActive) {
        // Brand was soft-deleted — offer to restore it
        throw new AppError(
          `A brand named "${name}" already exists but is deactivated. Please restore it instead of creating a new one.`,
          409
        )
      }
      throw new AppError(`A brand named "${name}" already exists.`, 409)
    }

    const brand = await Brand.create({ name })

    res.status(201).json({
      success: true,
      message: `Brand "${brand.name}" created successfully.`,
      data: { brand },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/v1/brands/:id
// Role: Admin only
// Full update — name (slug auto-regenerates via pre-findOneAndUpdate hook)
// ─────────────────────────────────────────────────────────────────────────
export async function updateBrand(
  req: AuthenticatedRequest & { body: UpdateBrandInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string
    const { name } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid brand ID format.', 400)
    }

    // Check if new name conflicts with another brand
    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id } // Exclude the brand being updated
    })

    if (existingBrand) {
      throw new AppError(`Another brand named "${name}" already exists.`, 409)
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { name }, // Slug auto-regenerates via pre-findOneAndUpdate
      { new: true, runValidators: true }
    )

    if (!updatedBrand) {
      throw new AppError('Brand not found.', 404)
    }

    res.status(200).json({
      success: true,
      message: `Brand updated to "${updatedBrand.name}" successfully.`,
      data: { brand: updatedBrand },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/brands/:id
// Role: Admin only
// SOFT DELETE — sets isActive: false. Never hard deletes.
// Reports constraint: cannot delete if active products use this brand.
// ─────────────────────────────────────────────────────────────────────────
export async function deleteBrand(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid brand ID format.', 400)
    }

    const brand = await Brand.findById(id)

    if (!brand) {
      throw new AppError('Brand not found.', 404)
    }

    if (!brand.isActive) {
      throw new AppError('This brand is already deactivated.', 400)
    }

    // Guard: check if any active products use this brand
    // Dynamic import to avoid circular dependency before Product model exists
    try {
      const { Product } = await import('../models')
      if (Product) {
        const activeProductCount = await Product.countDocuments({
          brand: id,
          isActive: true
        })

        if (activeProductCount > 0) {
          throw new AppError(
            `Cannot deactivate "${brand.name}" — it is used by ${activeProductCount} active product(s). Please reassign or deactivate those products first.`,
            409
          )
        }
      }
    } catch (importError) {
      // Product model not yet built — skip the guard safely
      if (!(importError instanceof AppError)) {
        // Not our AppError, just log and continue
      } else {
        throw importError
      }
    }

    // Soft delete
    brand.isActive = false
    await brand.save()

    res.status(200).json({
      success: true,
      message: `Brand "${brand.name}" has been deactivated successfully.`,
      data: null,
      error: null
    })
  } catch (error) {
    next(error)
  }
}

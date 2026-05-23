// backend/src/controllers/suppliers.controller.ts
// Full CRUD for suppliers — 5 endpoints from Section 9.

import { Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Supplier } from '../models'
import { AppError } from '../middleware/error.middleware'
import { AuthenticatedRequest } from '../types/auth.types'
import {
  CreateSupplierInput,
  UpdateSupplierInput
} from '../validators/supplier.validator'

export async function listSuppliers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true'
    const filter = includeInactive ? {} : { isActive: true }

    const suppliers = await Supplier.find(filter)
      .populate('brands', 'name')
      .sort({ name: 1 })
      .lean()

    res.status(200).json({
      success: true,
      message: `${suppliers.length} supplier(s) retrieved.`,
      data: { suppliers, total: suppliers.length },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

export async function getSupplierById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid supplier ID format.', 400)
    }

    const supplier = await Supplier.findById(id)
      .populate('brands', 'name')
      .lean()

    if (!supplier) throw new AppError('Supplier not found.', 404)
    if (!supplier.isActive) throw new AppError('Supplier is deactivated.', 404)

    res.status(200).json({
      success: true,
      message: 'Supplier retrieved successfully.',
      data: { supplier },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

export async function createSupplier(
  req: AuthenticatedRequest & { body: CreateSupplierInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, contactPerson, phone, address, brands, notes } = req.body

    const existing = await Supplier.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    })
    if (existing) {
      throw new AppError(`A supplier named "${name}" already exists.`, 409)
    }

    const supplier = await Supplier.create({
      name,
      contactPerson,
      phone,
      address,
      brands,
      notes
    })
    await supplier.populate('brands', 'name')

    res.status(201).json({
      success: true,
      message: `Supplier "${supplier.name}" created successfully.`,
      data: { supplier },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

export async function updateSupplier(
  req: AuthenticatedRequest & { body: UpdateSupplierInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid supplier ID format.', 400)
    }

    const updated = await Supplier.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    }).populate('brands', 'name')

    if (!updated) throw new AppError('Supplier not found.', 404)

    res.status(200).json({
      success: true,
      message: `Supplier "${updated.name}" updated successfully.`,
      data: { supplier: updated },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteSupplier(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid supplier ID format.', 400)
    }

    const supplier = await Supplier.findById(id)
    if (!supplier) throw new AppError('Supplier not found.', 404)
    if (!supplier.isActive) {
      throw new AppError('Supplier is already deactivated.', 400)
    }

    supplier.isActive = false
    await supplier.save()

    res.status(200).json({
      success: true,
      message: `Supplier "${supplier.name}" deactivated.`,
      data: null,
      error: null
    })
  } catch (error) {
    next(error)
  }
}

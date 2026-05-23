// backend/src/controllers/purchases.controller.ts

import { Response, NextFunction } from 'express'

import mongoose from 'mongoose'

// FIXED:
// Import Purchase directly from model file
import  Purchase  from '../models/Purchase.model'

// ADDED:
// Product needed for stock reversal
import { Product } from '../models'

import { AppError } from '../middleware/error.middleware'

import { AuthenticatedRequest } from '../types/auth.types'

import { createPurchaseWithTransaction } from '../services/purchase.service'

import {
  CreatePurchaseInput,
  ListPurchasesQuery
} from '../validators/purchase.validator'

// ─────────────────────────────────────────────
// Create Purchase
// ─────────────────────────────────────────────
export async function createPurchase(
  req: AuthenticatedRequest & {
    body: CreatePurchaseInput
  },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const purchase = await createPurchaseWithTransaction(
      req.body,
      req.user.userId
    )

    res.status(201).json({
      success: true,

      message: `Purchase ${purchase.purchaseNumber} recorded. Stock updated.`,

      data: {
        purchase
      },

      error: null
    })
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 400))

      return
    }

    next(error)
  }
}

// ─────────────────────────────────────────────
// List Purchases
// ─────────────────────────────────────────────
export async function listPurchases(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit, supplier, startDate, endDate } =
      req.query as unknown as ListPurchasesQuery

    // FIXED:
    const filter: Record<string, any> = {}

    // Supplier filter
    if (supplier && mongoose.Types.ObjectId.isValid(supplier)) {
      filter.supplier = new mongoose.Types.ObjectId(supplier)
    }

    // Date filter
    if (startDate || endDate) {
      filter.purchaseDate = {}

      if (startDate) {
        filter.purchaseDate.$gte = new Date(startDate)
      }

      if (endDate) {
        const end = new Date(endDate)

        end.setHours(23, 59, 59, 999)

        filter.purchaseDate.$lte = end
      }
    }

    // Pagination
    const currentPage = Math.max(1, Number(page) || 1)

    const itemsPerPage = Math.min(100, Math.max(1, Number(limit) || 20))

    const skip = (currentPage - 1) * itemsPerPage

    // Queries
    const [purchases, totalItems] = await Promise.all([
      Purchase.find(filter)
        .populate('supplier', 'name contactPerson phone')
        .populate('createdBy', 'name username')
        .sort({
          purchaseDate: -1
        })
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),

      Purchase.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.status(200).json({
      success: true,

      message: `${purchases.length} purchase(s) retrieved.`,

      data: {
        purchases,

        pagination: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,

          hasNextPage: currentPage < totalPages,

          hasPrevPage: currentPage > 1
        }
      },

      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// Get Purchase By ID
// ─────────────────────────────────────────────
export async function getPurchaseById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as {
      id: string
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid purchase ID format.', 400)
    }

    const purchase = await Purchase.findById(id)
      .populate('supplier', 'name contactPerson phone address')
      .populate('createdBy', 'name username')
      .lean()

    if (!purchase) {
      throw new AppError('Purchase not found.', 404)
    }

    res.status(200).json({
      success: true,

      message: 'Purchase retrieved successfully.',

      data: {
        purchase
      },

      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// Void Purchase
// ─────────────────────────────────────────────
export async function voidPurchase(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid purchase ID format.', 400)
    }

    const session = await mongoose.startSession()

    session.startTransaction()

    try {
      const purchase = await Purchase.findById(id).session(session)

      if (!purchase) {
        throw new AppError('Purchase not found.', 404)
      }

      // Reverse stock for each item
      // Ensure stock does not go below 0
      for (const item of purchase.items) {
        const product = await Product.findById(item.product)
          .session(session)
          .select('stockQty name')

        if (!product) {
          continue
        }

        if (product.stockQty < item.quantityReceived) {
          throw new AppError(
            `Cannot void: "${product.name}" only has ${product.stockQty} units ` +
              `but purchase added ${item.quantityReceived}. Stock may have been sold.`,
            400
          )
        }

        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stockQty: -item.quantityReceived
            }
          },
          { session }
        )
      }

      // Delete purchase after stock reversal
      await Purchase.findByIdAndDelete(id).session(session)

      await session.commitTransaction()

      res.status(200).json({
        success: true,

        message: `Purchase ${purchase.purchaseNumber} voided. Stock reversed.`,

        data: null,

        error: null
      })
    } catch (error) {
      await session.abortTransaction()

      throw error
    } finally {
      session.endSession()
    }
  } catch (error) {
    next(error)
  }
}

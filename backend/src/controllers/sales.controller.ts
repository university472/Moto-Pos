// backend/src/controllers/sales.controller.ts

import { Response, NextFunction } from 'express'
import mongoose from 'mongoose'

// FIX #1
// Import Sale directly from its model file
import { Sale, Product } from '../models'

import { AppError } from '../middleware/error.middleware'
import { AuthenticatedRequest } from '../types/auth.types'
import { createSaleWithTransaction } from '../services/sale.service'
import { CreateSaleInput, ListSalesQuery } from '../validators/sale.validator'

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/sales
// ─────────────────────────────────────────────────────────────────────────
export async function createSale(
  req: AuthenticatedRequest & { body: CreateSaleInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sale = await createSaleWithTransaction(req.body, req.user.userId)

    res.status(201).json({
      success: true,
      message: `Sale recorded. Invoice: ${sale.invoiceNumber}`,
      data: { sale },
      error: null
    })
  } catch (error) {
    if (error instanceof Error) {
      const isStockError =
        error.message.includes('Insufficient stock') ||
        error.message.includes('not found') ||
        error.message.includes('not active')

      next(new AppError(error.message, isStockError ? 400 : 500))
      return
    }

    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/sales
// ─────────────────────────────────────────────────────────────────────────
export async function listSales(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      page,
      limit,
      cashier,
      startDate,
      endDate,
      paymentMethod,
      invoiceNumber
    } = req.query as unknown as ListSalesQuery

    // FIX #2
    const filter: Record<string, any> = {}

    // ── Date range filter ──────────────────────────────────────────────
    if (startDate || endDate) {
      filter.createdAt = {}

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate)
      }

      if (endDate) {
        const endDateTime = new Date(endDate)

        endDateTime.setHours(23, 59, 59, 999)

        filter.createdAt.$lte = endDateTime
      }
    }

    // ── Cashier filter ────────────────────────────────────────────────
    if (cashier && mongoose.Types.ObjectId.isValid(cashier)) {
      filter.cashier = new mongoose.Types.ObjectId(cashier)
    }

    // ── Payment filter ────────────────────────────────────────────────
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod
    }

    // ── Invoice filter ────────────────────────────────────────────────
    if (invoiceNumber) {
      filter.invoiceNumber = {
        $regex: invoiceNumber,
        $options: 'i'
      }
    }

    // ── Pagination ────────────────────────────────────────────────────
    const currentPage = Math.max(1, Number(page) || 1)

    const itemsPerPage = Math.min(100, Math.max(1, Number(limit) || 20))

    const skip = (currentPage - 1) * itemsPerPage

    // ── Query DB ──────────────────────────────────────────────────────
    const [sales, totalItems] = await Promise.all([
      Sale.find(filter)
        .populate('cashier', 'name username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),

      Sale.countDocuments(filter)
    ])

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.status(200).json({
      success: true,
      message: `${sales.length} sale(s) retrieved.`,
      data: {
        sales,
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

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/sales/:id
// ─────────────────────────────────────────────────────────────────────────
export async function getSaleById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid sale ID format.', 400)
    }

    const sale = await Sale.findById(id)
      .populate('cashier', 'name username role')
      .lean()

    if (!sale) {
      throw new AppError('Sale not found.', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Sale retrieved successfully.',
      data: { sale },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/sales/invoice/:invoiceNumber
// ─────────────────────────────────────────────────────────────────────────
export async function getSaleByInvoiceNumber(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // FIX #3
    const invoiceNumber = String(req.params.invoiceNumber)

    const sale = await Sale.findOne({
      invoiceNumber: invoiceNumber.toUpperCase()
    })
      .populate('cashier', 'name username role')
      .lean()

    if (!sale) {
      throw new AppError(
        `No sale found with invoice number "${invoiceNumber.toUpperCase()}".`,
        404
      )
    }

    res.status(200).json({
      success: true,
      message: 'Sale retrieved successfully.',
      data: { sale },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/sales/today-summary
// ─────────────────────────────────────────────────────────────────────────
export async function getTodaySummary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const todayStart = new Date()

    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date()

    todayEnd.setHours(23, 59, 59, 999)

    const result = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: todayStart,
            $lte: todayEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: '$grandTotal'
          },
          totalTransactions: {
            $sum: 1
          },
          totalDiscount: {
            $sum: '$discountAmount'
          }
        }
      }
    ])

    const summary = result[0] ?? {
      totalRevenue: 0,
      totalTransactions: 0,
      totalDiscount: 0
    }

    res.status(200).json({
      success: true,
      message: "Today's summary retrieved.",
      data: { summary },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/sales/:id/void
// ─────────────────────────────────────────────────────────────────────────
export async function voidSale(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid sale ID format.', 400)
    }

    const session = await mongoose.startSession()

    session.startTransaction()

    try {
      const sale = await Sale.findById(id).session(session)

      if (!sale) {
        throw new AppError('Sale not found.', 404)
      }

      if (sale.isReturned) {
        throw new AppError('This sale has already been returned/voided.', 400)
      }

      // Restore stock for every item
      for (const item of sale.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stockQty: item.quantity
            }
          },
          { session }
        )
      }

      // Mark sale as returned (void = full return)
      sale.isReturned = true

      await sale.save({ session })

      await session.commitTransaction()

      res.status(200).json({
        success: true,
        message: `Sale ${sale.invoiceNumber} voided. Stock has been restored.`,
        data: { sale },
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

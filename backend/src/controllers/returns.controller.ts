// backend/src/controllers/returns.controller.ts

import { Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Return } from '../models'
import { AppError } from '../middleware/error.middleware'
import { AuthenticatedRequest } from '../types/auth.types'
import { processReturnWithTransaction } from '../services/return.service'
import { CreateReturnInput } from '../validators/return.validator'

export async function processReturn(
  req: AuthenticatedRequest & { body: CreateReturnInput },
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const returnDoc = await processReturnWithTransaction(
      req.body,
      req.user.userId
    )

    res.status(201).json({
      success: true,
      message: `Return ${returnDoc.returnNumber} processed. Stock restored.`,
      data: { return: returnDoc },
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

export async function listReturns(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20)
    const skip = (page - 1) * limit

    const [returns, total] = await Promise.all([
      Return.find()
        .populate('originalSale', 'invoiceNumber grandTotal createdAt')
        .populate('processedBy', 'name username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Return.countDocuments()
    ])

    res.status(200).json({
      success: true,
      message: `${returns.length} return(s) retrieved.`,
      data: {
        returns,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

export async function getReturnById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid return ID format.', 400)
    }

    const returnDoc = await Return.findById(id)
      .populate('originalSale', 'invoiceNumber grandTotal items createdAt')
      .populate('processedBy', 'name username')
      .lean()

    if (!returnDoc) throw new AppError('Return not found.', 404)

    res.status(200).json({
      success: true,
      message: 'Return retrieved successfully.',
      data: { return: returnDoc },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

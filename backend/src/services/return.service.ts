// backend/src/services/return.service.ts
// Atomic stock restoration on return processing.
// Validates against original sale — cannot return more than was sold.

import mongoose from 'mongoose'
import { Product, Sale, Return } from '../models'
import { CreateReturnInput } from '../validators/return.validator'
import { IReturn } from '../models/Return.model'
import { ISaleItem } from '../models/Sale.model'
import { AppError } from '../middleware/error.middleware'

// ── Return number generator (RET-YYYY-NNNNN) ──────────────────────────────
async function generateReturnNumber(
  session: mongoose.ClientSession
): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `RET-${year}-`

  const last = await Return.findOne(
    { returnNumber: { $regex: `^${prefix}` } },
    { returnNumber: 1 },
    { sort: { returnNumber: -1 } }
  )
    .session(session)
    .lean()

  let next = 1
  if (last) {
    const parts = last.returnNumber.split('-')
    const lastSeq = parseInt(parts[2], 10)
    if (!isNaN(lastSeq)) next = lastSeq + 1
  }

  return `${prefix}${String(next).padStart(5, '0')}`
}

// ── Main return processing with atomic stock restore ──────────────────────
export async function processReturnWithTransaction(
  data: CreateReturnInput,
  staffId: string
): Promise<IReturn> {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // STEP 1: Load original sale
    const originalSale = await Sale.findById(data.originalSale)
      .session(session)
      .lean()

    if (!originalSale) {
      throw new AppError('Original sale not found.', 404)
    }

    if (originalSale.isReturned) {
      throw new AppError('This sale has already been fully returned.', 400)
    }

    // STEP 2: Validate return items against the original sale
    const returnedItems: {
      product: mongoose.Types.ObjectId
      productName: string
      quantityReturned: number
      refundAmount: number
    }[] = []

    for (const returnItem of data.items) {
      // Find the matching item in the original sale
      const saleItem = (originalSale.items as ISaleItem[]).find(
        (si) => si.product.toString() === returnItem.product
      )

      if (!saleItem) {
        throw new AppError(
          `Product with ID "${returnItem.product}" was not in the original sale.`,
          400
        )
      }

      if (returnItem.quantityReturned > saleItem.quantity) {
        throw new AppError(
          `Cannot return ${returnItem.quantityReturned} units of "${saleItem.productName}" — only ${saleItem.quantity} were sold.`,
          400
        )
      }

      returnedItems.push({
        product: saleItem.product,
        productName: saleItem.productName,
        quantityReturned: returnItem.quantityReturned,
        refundAmount: saleItem.unitPrice // Refund at original sale price
      })
    }

    // STEP 3: Generate return number
    const returnNumber = await generateReturnNumber(session)

    // STEP 4: Calculate total refund
    const totalRefund = returnedItems.reduce(
      (sum, item) => sum + item.refundAmount * item.quantityReturned,
      0
    )

    // STEP 5: Create Return document
    const [returnDoc] = await Return.create(
      [
        {
          returnNumber,
          originalSale: data.originalSale,
          processedBy: new mongoose.Types.ObjectId(staffId),
          items: returnedItems,
          totalRefund,
          reason: data.reason,
          refundMethod: data.refundMethod ?? 'cash'
        }
      ],
      { session }
    )

    // STEP 6: Atomically restore stock for each returned item
    for (const item of returnedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQty: item.quantityReturned } },
        { session }
      )
    }

    // STEP 7: Mark original sale as returned (if ALL items returned)
    const allItemsReturned = data.items.every((ri) => {
      const saleItem = (originalSale.items as ISaleItem[]).find(
        (si) => si.product.toString() === ri.product
      )
      return saleItem && ri.quantityReturned >= saleItem.quantity
    })

    if (allItemsReturned) {
      await Sale.findByIdAndUpdate(
        data.originalSale,
        { $set: { isReturned: true } },
        { session }
      )
    }

    // STEP 8: Commit
    await session.commitTransaction()

    const populated = await Return.findById(returnDoc._id)
      .populate('originalSale', 'invoiceNumber grandTotal')
      .populate('processedBy', 'name username')
      .lean()

    return populated as IReturn
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

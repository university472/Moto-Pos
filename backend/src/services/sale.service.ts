// backend/src/services/sale.service.ts
// Core sale creation logic — exact MongoDB transaction pattern from Section 10.
//
// CRITICAL RULES enforced here:
//   1. Stock deduction is ATOMIC — if anything fails, stock is NOT deducted
//   2. Price SNAPSHOTS are taken from the product at time of sale
//   3. If stock is insufficient, sale is rejected BEFORE creating any record
//   4. Invoice number is generated INSIDE the transaction
//   5. All 7 steps happen in one session — commit or rollback together
//
// UPDATED:
//   - STEP 5 now uses FULLY ATOMIC CONDITIONAL stock deduction
//   - Prevents negative stock during concurrent sales
//   - Uses findOneAndUpdate + stockQty condition
//   - Returns detailed stock error messages

import mongoose from 'mongoose'
import { Product, Sale } from '../models'
import { generateInvoiceNumber } from './invoice.service'
import { ISale, ISaleItem } from '../models/Sale.model'
import { CreateSaleInput } from '../validators/sale.validator'

// ── Helper: compute discount amount from type + value + subtotal ──────────
function computeDiscountAmount(
  discountType: 'percentage' | 'flat' | 'none',
  discountValue: number,
  subtotal: number
): number {
  switch (discountType) {
    case 'percentage': {
      const amount = (subtotal * discountValue) / 100

      // Cap percentage discount — cannot exceed subtotal
      return Math.min(amount, subtotal)
    }

    case 'flat':
      // Cap flat discount — cannot exceed subtotal
      return Math.min(discountValue, subtotal)

    case 'none':
    default:
      return 0
  }
}

// ── Main service function: create sale with full transaction ──────────────
export async function createSaleWithTransaction(
  saleData: CreateSaleInput,
  cashierId: string
): Promise<ISale> {
  // ── Start MongoDB session ───────────────────────────────────────────────
  const session = await mongoose.startSession()

  session.startTransaction()

  try {
    // ──────────────────────────────────────────────────────────────────────
    // STEP 1: Validate all products before any write
    // ──────────────────────────────────────────────────────────────────────

    const validatedItems: {
      product: mongoose.Types.ObjectId
      productName: string
      productSku: string
      quantity: number
      unitPrice: number
      purchasePrice: number
      subtotal: number
    }[] = []

    for (const item of saleData.items) {
      const product = await Product.findById(item.product)
        .session(session)
        .select('name sku salePrice purchasePrice stockQty isActive')
        .lean()

      if (!product) {
        throw new Error(
          `Product not found: ${item.product}. It may have been deleted.`
        )
      }

      if (!product.isActive) {
        throw new Error(
          `Product "${product.name}" is no longer active and cannot be sold.`
        )
      }

      if (product.stockQty < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". ` +
            `Requested: ${item.quantity}, Available: ${product.stockQty}.`
        )
      }

      // Build sale item with SNAPSHOT prices
      validatedItems.push({
        product: product._id as mongoose.Types.ObjectId,

        productName: product.name,

        productSku: product.sku,

        quantity: item.quantity,

        // Snapshot at time of sale
        unitPrice: product.salePrice,

        // Snapshot for profit calculation
        purchasePrice: product.purchasePrice,

        subtotal: item.quantity * product.salePrice
      })
    }

    // ──────────────────────────────────────────────────────────────────────
    // STEP 2: Generate invoice number INSIDE transaction
    // ──────────────────────────────────────────────────────────────────────

    const invoiceNumber = await generateInvoiceNumber(session)

    // ──────────────────────────────────────────────────────────────────────
    // STEP 3: Calculate totals
    // ──────────────────────────────────────────────────────────────────────

    const subtotal = validatedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    )

    const discountType = saleData.discountType ?? 'none'

    const discountValue = saleData.discountValue ?? 0

    const discountAmount = computeDiscountAmount(
      discountType,
      discountValue,
      subtotal
    )

    const grandTotal = subtotal - discountAmount

    // Safety check
    if (grandTotal < 0) {
      throw new Error(
        'Grand total cannot be negative. Discount exceeds the sale amount.'
      )
    }

    // ──────────────────────────────────────────────────────────────────────
    // STEP 4: Create Sale document
    // ──────────────────────────────────────────────────────────────────────

    const saleDocuments = await Sale.create(
      [
        {
          invoiceNumber,

          cashier: new mongoose.Types.ObjectId(cashierId),

          customerName: saleData.customerName?.trim() ?? '',

          items: validatedItems as ISaleItem[],

          subtotal,

          discountType,

          discountValue,

          discountAmount,

          grandTotal,

          paymentMethod: saleData.paymentMethod ?? 'cash',

          notes: saleData.notes?.trim() ?? '',

          isReturned: false
        }
      ],
      { session }
    )

    const createdSale = saleDocuments[0]

    // ──────────────────────────────────────────────────────────────────────
    // STEP 5: Atomically deduct stock — only if sufficient stock exists
    // ──────────────────────────────────────────────────────────────────────

    for (const item of saleData.items) {
      const result = await Product.findOneAndUpdate(
        {
          _id: item.product,

          // Conditional: only update if enough stock exists
          stockQty: { $gte: item.quantity }
        },
        {
          $inc: { stockQty: -item.quantity }
        },
        {
          session,
          new: true
        }
      )

      // If result is null, stock condition failed
      if (!result) {
        // Fetch current stock for better error message
        const current = await Product.findById(item.product)
          .session(session)
          .select('name stockQty')

        throw new Error(
          `Insufficient stock for "${current?.name ?? item.product}". ` +
            `Available: ${current?.stockQty ?? 0}, Requested: ${item.quantity}. ` +
            `Please refresh and try again.`
        )
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // STEP 6: Commit transaction
    // ──────────────────────────────────────────────────────────────────────

    await session.commitTransaction()

    // ──────────────────────────────────────────────────────────────────────
    // STEP 7: Return populated sale
    // ──────────────────────────────────────────────────────────────────────

    const populatedSale = await Sale.findById(createdSale._id)
      .populate('cashier', 'name username')
      .lean()

    if (!populatedSale) {
      throw new Error('Sale was created but could not be retrieved.')
    }

    return populatedSale as ISale
  } catch (error) {
    // ── ROLLBACK ──────────────────────────────────────────────────────────

    await session.abortTransaction()

    throw error
  } finally {
    // Always release session
    session.endSession()
  }
}

// ── Helper: get sale by ID with full population ───────────────────────────
export async function getSaleById(saleId: string): Promise<ISale | null> {
  return Sale.findById(saleId)
    .populate('cashier', 'name username role')
    .lean() as Promise<ISale | null>
}

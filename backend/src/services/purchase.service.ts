// backend/src/services/purchase.service.ts
// Atomic stock increase on purchase creation.
// Same transaction pattern as sale.service.ts — all or nothing.

import mongoose from 'mongoose'
import { Product, Purchase, Supplier } from '../models'
import { CreatePurchaseInput } from '../validators/purchase.validator'
import { IPurchase } from '../models/Purchase.model'

// ── Purchase number generator (PUR-YYYY-NNNNN) ────────────────────────────
async function generatePurchaseNumber(
  session: mongoose.ClientSession
): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `PUR-${year}-`

  const last = await Purchase.findOne(
    { purchaseNumber: { $regex: `^${prefix}` } },
    { purchaseNumber: 1 },
    { sort: { purchaseNumber: -1 } }
  )
    .session(session)
    .lean()

  let next = 1
  if (last) {
    const parts = last.purchaseNumber.split('-')
    const lastSeq = parseInt(parts[2], 10)
    if (!isNaN(lastSeq)) next = lastSeq + 1
  }

  if (next > 99999) {
    throw new Error(`Purchase number limit reached for ${year}.`)
  }

  return `${prefix}${String(next).padStart(5, '0')}`
}

// ── Main purchase creation with atomic stock increase ─────────────────────
export async function createPurchaseWithTransaction(
  data: CreatePurchaseInput,
  adminId: string
): Promise<IPurchase> {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // STEP 1: Validate supplier
    const supplier = await Supplier.findById(data.supplier)
      .session(session)
      .select('_id isActive name')
    if (!supplier || !supplier.isActive) {
      throw new Error('Supplier not found or is deactivated.')
    }

    // STEP 2: Validate all products + build item snapshots
    const validatedItems: {
      product: mongoose.Types.ObjectId
      productName: string
      quantityReceived: number
      purchasePricePerUnit: number
      subtotal: number
    }[] = []

    for (const item of data.items) {
      const product = await Product.findById(item.product)
        .session(session)
        .select('_id name isActive purchasePrice')

      if (!product || !product.isActive) {
        throw new Error(`Product not found or inactive: ${item.product}`)
      }

      validatedItems.push({
        product: product._id as mongoose.Types.ObjectId,
        productName: product.name,
        quantityReceived: item.quantityReceived,
        purchasePricePerUnit: item.purchasePricePerUnit,
        subtotal: item.quantityReceived * item.purchasePricePerUnit
      })
    }

    // STEP 3: Generate purchase number
    const purchaseNumber = await generatePurchaseNumber(session)

    // STEP 4: Compute total
    const totalAmount = validatedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    )

    // STEP 5: Create Purchase document
    const [purchase] = await Purchase.create(
      [
        {
          purchaseNumber,
          supplier: data.supplier,
          items: validatedItems,
          totalAmount,
          purchaseDate: data.purchaseDate
            ? new Date(data.purchaseDate)
            : new Date(),
          notes: data.notes ?? '',
          createdBy: new mongoose.Types.ObjectId(adminId)
        }
      ],
      { session }
    )

    // STEP 6: Atomically increase stock for each product
    for (const item of data.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: { stockQty: item.quantityReceived },
          // Optionally update purchase price if requested
          ...(item.updateProductPrice
            ? { $set: { purchasePrice: item.purchasePricePerUnit } }
            : {})
        },
        { session }
      )
    }

    // STEP 7: Commit
    await session.commitTransaction()

    // Return populated purchase
    const populated = await Purchase.findById(purchase._id)
      .populate('supplier', 'name contactPerson phone')
      .populate('createdBy', 'name username')
      .lean()

    return populated as IPurchase
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

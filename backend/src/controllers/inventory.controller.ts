// backend/src/controllers/inventory.controller.ts

// Inventory overview, low-stock list, stock movement history

import { Response, NextFunction } from 'express'

import mongoose from 'mongoose'

// FIXED:
// Import models directly
import  Product  from '../models/Product.model'
import  Sale  from '../models/Sale.model'
import  Purchase  from '../models/Purchase.model'

import { AppError } from '../middleware/error.middleware'

import { AuthenticatedRequest } from '../types/auth.types'

// ─────────────────────────────────────────────
// GET /inventory/summary
// ─────────────────────────────────────────────
export async function getInventorySummary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [summary] = await Product.aggregate([
      {
        $match: {
          isActive: true
        }
      },

      {
        $group: {
          _id: null,

          totalProducts: {
            $sum: 1
          },

          totalStockUnits: {
            $sum: '$stockQty'
          },

          totalStockValue: {
            $sum: {
              $multiply: ['$stockQty', '$purchasePrice']
            }
          },

          totalSaleValue: {
            $sum: {
              $multiply: ['$stockQty', '$salePrice']
            }
          },

          outOfStockCount: {
            $sum: {
              $cond: [
                {
                  $eq: ['$stockQty', 0]
                },
                1,
                0
              ]
            }
          },

          lowStockCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gt: ['$stockQty', 0]
                    },
                    {
                      $lte: ['$stockQty', '$lowStockThreshold']
                    }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ])

    res.status(200).json({
      success: true,

      message: 'Inventory summary retrieved.',

      data: {
        summary: summary ?? {
          totalProducts: 0,
          totalStockUnits: 0,
          totalStockValue: 0,
          totalSaleValue: 0,
          outOfStockCount: 0,
          lowStockCount: 0
        }
      },

      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// GET /inventory/low-stock
// ─────────────────────────────────────────────
export async function getLowStockInventory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await Product.find({
      isActive: true,

      $expr: {
        $lte: ['$stockQty', '$lowStockThreshold']
      }
    })
      .populate('brand', 'name')
      .populate('category', 'name')
      .sort({
        stockQty: 1
      })
      .select(
        'name sku stockQty lowStockThreshold salePrice purchasePrice brand category'
      )
      .lean()

    res.status(200).json({
      success: true,

      message: `${products.length} low-stock product(s) found.`,

      data: {
        products,
        count: products.length
      },

      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// GET /inventory/:productId/history
// ─────────────────────────────────────────────
export async function getStockHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // FIXED:
    const productId = String(req.params.productId)

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new AppError('Invalid product ID format.', 400)
    }

    const productObjId = new mongoose.Types.ObjectId(productId)

    // Sales
    const salesHistory = await Sale.find(
      {
        'items.product': productObjId
      },
      {
        invoiceNumber: 1,
        createdAt: 1,
        'items.$': 1
      }
    )
      .sort({
        createdAt: -1
      })
      .limit(50)
      .lean()

    // Purchases
    const purchasesHistory = await Purchase.find(
      {
        'items.product': productObjId
      },
      {
        purchaseNumber: 1,
        purchaseDate: 1,
        'items.$': 1
      }
    )
      .populate('supplier', 'name')
      .sort({
        purchaseDate: -1
      })
      .limit(50)
      .lean()

    // Movement Type
    type MovementEntry = {
      type: 'sale' | 'purchase'

      date: Date

      reference: string

      quantity: number

      direction: 'in' | 'out'

      unitPrice: number
    }

    // FIXED:
    const movements: MovementEntry[] = [
      ...salesHistory.map((sale: any) => ({
        type: 'sale' as const,

        date: sale.createdAt,

        reference: sale.invoiceNumber,

        quantity: sale.items?.[0]?.quantity ?? 0,

        direction: 'out' as const,

        unitPrice: sale.items?.[0]?.unitPrice ?? 0
      })),

      ...purchasesHistory.map((purchase: any) => ({
        type: 'purchase' as const,

        date: purchase.purchaseDate,

        reference: purchase.purchaseNumber,

        quantity: purchase.items?.[0]?.quantityReceived ?? 0,

        direction: 'in' as const,

        unitPrice: purchase.items?.[0]?.purchasePricePerUnit ?? 0
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    res.status(200).json({
      success: true,

      message: 'Stock history retrieved.',

      data: {
        movements,
        total: movements.length
      },

      error: null
    })
  } catch (error) {
    next(error)
  }
}

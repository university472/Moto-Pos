// backend/src/controllers/dashboard.controller.ts
// Three dashboard endpoints from Section 9.
// All use MongoDB aggregation — no N+1 queries.

import { Response, NextFunction } from 'express'
import { Product, Sale } from '../models'
import { AuthenticatedRequest } from '../types/auth.types'

// ── GET /api/v1/dashboard/stats ───────────────────────────────────────────
// Today's sales total, transaction count, low-stock count, total stock value
export async function getDashboardStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // Run all 3 aggregations in parallel
    const [salesAgg, inventoryAgg] = await Promise.all([
      Sale.aggregate([
        { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
        {
          $group: {
            _id: null,
            todayRevenue: { $sum: '$grandTotal' },
            todayTransactions: { $count: {} },
            todayDiscount: { $sum: '$discountAmount' }
          }
        }
      ]),

      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalStockValue: {
              $sum: { $multiply: ['$stockQty', '$purchasePrice'] }
            },
            lowStockCount: {
              $sum: {
                $cond: [{ $lte: ['$stockQty', '$lowStockThreshold'] }, 1, 0]
              }
            },
            outOfStockCount: {
              $sum: { $cond: [{ $eq: ['$stockQty', 0] }, 1, 0] }
            }
          }
        }
      ])
    ])

    const sales = salesAgg[0] ?? {
      todayRevenue: 0,
      todayTransactions: 0,
      todayDiscount: 0
    }
    const inventory = inventoryAgg[0] ?? {
      totalStockValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved.',
      data: {
        stats: {
          todayRevenue: sales.todayRevenue,
          todayTransactions: sales.todayTransactions,
          todayDiscount: sales.todayDiscount,
          totalStockValue: inventory.totalStockValue,
          lowStockCount: inventory.lowStockCount,
          outOfStockCount: inventory.outOfStockCount
        }
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/v1/dashboard/top-today ──────────────────────────────────────
// Top 5 products sold today by revenue
export async function getTopProductsToday(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const topProducts = await Sale.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          productSku: { $first: '$items.productSku' },
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ])

    res.status(200).json({
      success: true,
      message: 'Top products today retrieved.',
      data: { topProducts },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/v1/dashboard/chart?days=7 ───────────────────────────────────
// Daily sales totals for the last N days — used by the Recharts bar chart
export async function getSalesChartData(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const days = Math.min(
      90,
      Math.max(1, parseInt(req.query.days as string) || 7)
    )

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days + 1)
    startDate.setHours(0, 0, 0, 0)

    const chartData = await Sale.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$grandTotal' },
          transactions: { $count: {} }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day'
                }
              }
            }
          },
          revenue: 1,
          transactions: 1
        }
      },
      { $sort: { date: 1 } }
    ])

    // Fill in missing days with 0 revenue
    const filledData: {
      date: string
      revenue: number
      transactions: number
    }[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const existing = chartData.find((d) => d.date === dateStr)
      filledData.push(
        existing ?? { date: dateStr, revenue: 0, transactions: 0 }
      )
    }

    res.status(200).json({
      success: true,
      message: `Sales chart data for last ${days} days.`,
      data: { chartData: filledData, days },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// backend/src/controllers/reports.controller.ts
// All 6 report endpoints from Section 9 using MongoDB aggregation pipelines.

import { Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Sale, Product } from '../models'
import { AuthenticatedRequest } from '../types/auth.types'

// ── Helper: parse date range from query ───────────────────────────────────
function parseDateRange(
  startStr?: string,
  endStr?: string
): { start: Date; end: Date } {
  const start = startStr ? new Date(startStr) : new Date()
  const end = endStr ? new Date(endStr) : new Date()

  if (!startStr) start.setHours(0, 0, 0, 0)
  if (!endStr) end.setHours(23, 59, 59, 999)
  else end.setHours(23, 59, 59, 999)

  return { start, end }
}

// ── GET /api/v1/reports/daily?date= ──────────────────────────────────────
export async function getDailyReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dateStr =
      (req.query.date as string) || new Date().toISOString().split('T')[0]
    const date = new Date(dateStr)
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const [summary, salesByHour, salesList] = await Promise.all([
      Sale.aggregate([
        { $match: { createdAt: { $gte: dayStart, $lte: dayEnd } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$grandTotal' },
            totalTransactions: { $count: {} },
            totalDiscount: { $sum: '$discountAmount' },
            totalItems: { $sum: { $size: '$items' } },
            cashSales: {
              $sum: {
                $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$grandTotal', 0]
              }
            },
            creditSales: {
              $sum: {
                $cond: [{ $eq: ['$paymentMethod', 'credit'] }, '$grandTotal', 0]
              }
            }
          }
        }
      ]),

      Sale.aggregate([
        { $match: { createdAt: { $gte: dayStart, $lte: dayEnd } } },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            revenue: { $sum: '$grandTotal' },
            count: { $count: {} }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      Sale.find({ createdAt: { $gte: dayStart, $lte: dayEnd } })
        .populate('cashier', 'name')
        .sort({ createdAt: -1 })
        .lean()
    ])

    res.status(200).json({
      success: true,
      message: `Daily report for ${dateStr}.`,
      data: {
        date: dateStr,
        summary: summary[0] ?? {
          totalRevenue: 0,
          totalTransactions: 0,
          totalDiscount: 0,
          totalItems: 0,
          cashSales: 0,
          creditSales: 0
        },
        salesByHour,
        sales: salesList
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/v1/reports/monthly?year=&month= ──────────────────────────────
export async function getMonthlyReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const now = new Date()
    const year = parseInt(req.query.year as string) || now.getFullYear()
    const month = parseInt(req.query.month as string) || now.getMonth() + 1

    const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0)
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)

    const [summary, dailyBreakdown] = await Promise.all([
      Sale.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$grandTotal' },
            totalTransactions: { $count: {} },
            totalDiscount: { $sum: '$discountAmount' },
            avgSaleValue: { $avg: '$grandTotal' }
          }
        }
      ]),

      Sale.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
        {
          $group: {
            _id: { $dayOfMonth: '$createdAt' },
            revenue: { $sum: '$grandTotal' },
            transactions: { $count: {} }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            day: '$_id',
            revenue: 1,
            transactions: 1
          }
        }
      ])
    ])

    res.status(200).json({
      success: true,
      message: `Monthly report for ${year}-${String(month).padStart(2, '0')}.`,
      data: {
        year,
        month,
        summary: summary[0] ?? {
          totalRevenue: 0,
          totalTransactions: 0,
          totalDiscount: 0,
          avgSaleValue: 0
        },
        dailyBreakdown
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/v1/reports/top-products?start=&end=&limit=10 ─────────────────
export async function getTopProductsReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { start, end } = parseDateRange(
      req.query.start as string,
      req.query.end as string
    )
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10)

    const topProducts = await Sale.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          productSku: { $first: '$items.productSku' },
          totalQtySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          totalProfit: {
            $sum: {
              $multiply: [
                { $subtract: ['$items.unitPrice', '$items.purchasePrice'] },
                '$items.quantity'
              ]
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit }
    ])

    res.status(200).json({
      success: true,
      message: `Top ${limit} products report.`,
      data: { topProducts, period: { start, end } },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/v1/reports/profit?start=&end= ────────────────────────────────
export async function getProfitReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { start, end } = parseDateRange(
      req.query.start as string,
      req.query.end as string
    )

    const profitData = await Sale.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          productSku: { $first: '$items.productSku' },
          totalQtySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          totalCost: {
            $sum: {
              $multiply: ['$items.purchasePrice', '$items.quantity']
            }
          },
          totalProfit: {
            $sum: {
              $multiply: [
                { $subtract: ['$items.unitPrice', '$items.purchasePrice'] },
                '$items.quantity'
              ]
            }
          }
        }
      },
      {
        $addFields: {
          profitMarginPct: {
            $cond: [
              { $gt: ['$totalCost', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$totalProfit', '$totalCost'] },
                      100
                    ]
                  },
                  1
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { totalProfit: -1 } }
    ])

    // Overall summary
    const overall = profitData.reduce(
      (acc, item) => ({
        totalRevenue: acc.totalRevenue + item.totalRevenue,
        totalCost: acc.totalCost + item.totalCost,
        totalProfit: acc.totalProfit + item.totalProfit
      }),
      { totalRevenue: 0, totalCost: 0, totalProfit: 0 }
    )

    res.status(200).json({
      success: true,
      message: 'Profit/loss report.',
      data: {
        profitData,
        overall: {
          ...overall,
          overallMarginPct:
            overall.totalCost > 0
              ? Math.round(
                  (overall.totalProfit / overall.totalCost) * 100 * 10
                ) / 10
              : 0
        },
        period: { start, end }
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/v1/reports/range?start=&end= ─────────────────────────────────
export async function getRangeReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { start, end } = parseDateRange(
      req.query.start as string,
      req.query.end as string
    )

    const [summary, dailyBreakdown] = await Promise.all([
      Sale.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$grandTotal' },
            totalTransactions: { $count: {} },
            totalDiscount: { $sum: '$discountAmount' }
          }
        }
      ]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            revenue: { $sum: '$grandTotal' },
            transactions: { $count: {} }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', revenue: 1, transactions: 1 } }
      ])
    ])

    res.status(200).json({
      success: true,
      message: 'Date range report.',
      data: {
        period: { start, end },
        summary: summary[0] ?? {
          totalRevenue: 0,
          totalTransactions: 0,
          totalDiscount: 0
        },
        dailyBreakdown
      },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

// ── GET /api/v1/reports/cashier ───────────────────────────────────────────
export async function getCashierReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { start, end } = parseDateRange(
      req.query.start as string,
      req.query.end as string
    )

    const filter: Record<string, any> = {
      createdAt: { $gte: start, $lte: end }
    }

    if (
      req.query.cashierId &&
      mongoose.Types.ObjectId.isValid(req.query.cashierId as string)
    ) {
      filter.cashier = new mongoose.Types.ObjectId(
        req.query.cashierId as string
      )
    }

    const cashierData = await Sale.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$cashier',
          totalRevenue: { $sum: '$grandTotal' },
          totalTransactions: { $count: {} },
          totalDiscount: { $sum: '$discountAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'cashierInfo'
        }
      },
      { $unwind: { path: '$cashierInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          cashierName: '$cashierInfo.name',
          cashierUsername: '$cashierInfo.username',
          totalRevenue: 1,
          totalTransactions: 1,
          totalDiscount: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ])

    res.status(200).json({
      success: true,
      message: 'Cashier report.',
      data: { cashierData, period: { start, end } },
      error: null
    })
  } catch (error) {
    next(error)
  }
}

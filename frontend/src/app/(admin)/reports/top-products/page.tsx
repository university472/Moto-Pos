// frontend/src/app/(admin)/reports/top-products/page.tsx

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Loader2, Medal } from 'lucide-react'
import api from '@/lib/api'
import { ApiResponse } from '@/types/api'
import { formatPKR } from '@/lib/utils'

import './top-products.css'

interface TopProduct {
  _id: string
  productName: string
  productSku: string
  totalQtySold: number
  totalRevenue: number
  totalProfit: number
}

interface TopProductsData {
  topProducts: TopProduct[]
  period: { start: Date; end: Date }
}

export default function TopProductsReportPage() {
  const now = new Date()

  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]

  const [startDate, setStartDate] = useState(firstOfMonth)
  const [endDate, setEndDate] = useState(now.toISOString().split('T')[0])
  const [limit, setLimit] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'top-products', startDate, endDate, limit],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TopProductsData>>(
        `/reports/top-products?start=${startDate}&end=${endDate}&limit=${limit}`
      )

      return res.data.data
    }
  })

  const products = data?.topProducts ?? []
  const maxRevenue = products[0]?.totalRevenue ?? 1

  const medalClass = (idx: number) => {
    if (idx === 0) return 'medal-gold'
    if (idx === 1) return 'medal-silver'
    if (idx === 2) return 'medal-bronze'

    return ''
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <TrendingUp className="page-title-icon" />
            Top Products Report
          </h1>

          <p className="page-subtitle">
            Best-selling products ranked by revenue
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="top-products-filters">
        <label htmlFor="start-date" className="filter-label">
          Start Date
        </label>

        <input
          id="start-date"
          type="date"
          title="Select start date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="date-input"
        />

        <span className="filter-separator">to</span>

        <label htmlFor="end-date" className="sr-only">
          End Date
        </label>

        <input
          id="end-date"
          type="date"
          title="Select end date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="date-input"
        />

        <span className="filter-label margin-left">Show:</span>

        {[5, 10, 20].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setLimit(n)}
            className={`limit-button ${
              limit === n ? 'limit-button-active' : ''
            }`}
          >
            Top {n}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-state">
          <Loader2 className="loading-icon" />

          <span className="loading-text">Calculating top products...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <TrendingUp className="empty-icon" />

          <p className="empty-title">No sales data for this period</p>

          <p className="empty-text">Try selecting a wider date range.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-center w-12">#</th>
                <th>Product</th>
                <th className="text-center">Units Sold</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Profit</th>
                <th>Revenue Share</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product, idx) => {
                const revenueShare = Math.round(
                  (product.totalRevenue / maxRevenue) * 100
                )

                return (
                  <tr key={product._id}>
                    <td className="text-center">
                      {idx < 3 ? (
                        <Medal className={`medal-icon ${medalClass(idx)}`} />
                      ) : (
                        <span className="rank-number">{idx + 1}</span>
                      )}
                    </td>

                    <td>
                      <p className="product-name">{product.productName}</p>

                      <p className="product-sku">{product.productSku}</p>
                    </td>

                    <td className="qty-sold">{product.totalQtySold}</td>

                    <td className="revenue-cell">
                      {formatPKR(product.totalRevenue)}
                    </td>

                    <td
                      className={`profit-cell ${
                        product.totalProfit >= 0
                          ? 'profit-positive'
                          : 'profit-negative'
                      }`}
                    >
                      {product.totalProfit >= 0 ? '+' : ''}
                      {formatPKR(product.totalProfit)}
                    </td>

                    <td>
                      <div className="revenue-share-wrapper">
                        <div className="revenue-track">
                          <div
                            className={`revenue-bar ${
                              idx === 0
                                ? 'revenue-bar-primary'
                                : 'revenue-bar-secondary'
                            }`}
                            style={{
                              width: `${revenueShare}%`
                            }}
                          />
                        </div>

                        <span className="revenue-percent">{revenueShare}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Footer */}
          <div className="table-footer">
            <p className="footer-text">
              Showing top {products.length} products by revenue
            </p>

            <p className="footer-total">
              Total:{' '}
              {formatPKR(products.reduce((sum, p) => sum + p.totalRevenue, 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

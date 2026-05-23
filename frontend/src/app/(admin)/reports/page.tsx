// frontend/src/app/(admin)/reports/page.tsx
// Reports hub — central navigation to all 4 report pages.

import Link from 'next/link'
import {
  BarChart2,
  Calendar,
  CalendarDays,
  TrendingUp,
  DollarSign,
  ArrowRight
} from 'lucide-react'

const REPORTS = [
  {
    title: 'Daily Sales Report',
    description:
      'All transactions for a single day. Choose any date to view total revenue, transaction count, cash vs credit breakdown, and full sale list.',
    href: '/reports/daily',
    icon: Calendar,
    color: '#0F5469',
    bg: 'rgba(15,84,105,0.08)',
    tag: 'Most Used',
    tagColor: '#0F5469',
    tagBg: 'rgba(15,84,105,0.1)'
  },
  {
    title: 'Monthly Summary',
    description:
      'Month-over-month view with daily bar chart. Select any month and year to see total revenue, transaction count, average sale value, and daily breakdown.',
    href: '/reports/monthly',
    icon: CalendarDays,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.08)',
    tag: 'Overview',
    tagColor: '#7C3AED',
    tagBg: 'rgba(139,92,246,0.1)'
  },
  {
    title: 'Top Products Report',
    description:
      'Best-selling products ranked by revenue or quantity. Filter by any date range to identify which products drive the most business.',
    href: '/reports/top-products',
    icon: TrendingUp,
    color: '#16A34A',
    bg: '#DCFCE7',
    tag: 'Sales Intelligence',
    tagColor: '#166534',
    tagBg: '#DCFCE7'
  },
  {
    title: 'Profit / Loss Report',
    description:
      'Per-product profit analysis using purchase price vs sale price. Shows gross margin percentage for every product sold in the date range.',
    href: '/reports/profit',
    icon: DollarSign,
    color: '#F59E0B',
    bg: '#FEF3C7',
    tag: 'Finance',
    tagColor: '#92400E',
    tagBg: '#FEF3C7'
  }
]

export default function ReportsHubPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6" style={{ color: '#0F5469' }} />
            Reports
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            Business intelligence for your shop
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {REPORTS.map((report) => {
          const Icon = report.icon
          return (
            <Link
              key={report.href}
              href={report.href}
              className="block bg-white rounded-xl border p-6 group transition-all duration-150"
              style={{ borderColor: '#E2E8F0' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor =
                  report.color
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  `0 4px 12px rgba(0,0,0,0.08)`
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor =
                  '#E2E8F0'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: report.bg }}
                >
                  <Icon className="h-6 w-6" style={{ color: report.color }} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: report.tagBg,
                      color: report.tagColor
                    }}
                  >
                    {report.tag}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    style={{ color: '#CBD5E1' }}
                  />
                </div>
              </div>
              <h3
                className="font-semibold text-base mb-2"
                style={{ color: '#1E293B' }}
              >
                {report.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#64748B' }}
              >
                {report.description}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Quick tip */}
      <div
        className="mt-6 p-4 rounded-lg border"
        style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
      >
        <p className="text-sm" style={{ color: '#64748B' }}>
          <span className="font-semibold" style={{ color: '#1E293B' }}>
            💡 Tip:
          </span>{' '}
          For end-of-day review, use <strong>Daily Sales</strong>. For monthly
          accounting, use <strong>Monthly Summary</strong>. To order more of
          your best-sellers, use <strong>Top Products</strong>. To find where
          your profit comes from, use <strong>Profit / Loss</strong>.
        </p>
      </div>
    </div>
  )
}

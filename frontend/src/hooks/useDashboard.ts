// frontend/src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { ApiResponse } from '@/types/api'

interface DashboardStats {
  todayRevenue: number
  todayTransactions: number
  todayDiscount: number
  totalStockValue: number
  lowStockCount: number
  outOfStockCount: number
}

interface TopProduct {
  _id: string
  productName: string
  productSku: string
  totalQty: number
  totalRevenue: number
}

interface ChartDataPoint {
  date: string
  revenue: number
  transactions: number
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res =
        await api.get<ApiResponse<{ stats: DashboardStats }>>(
          '/dashboard/stats'
        )
      return res.data.data.stats
    },
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    staleTime: 60 * 1000
  })
}

export function useTopProductsToday() {
  return useQuery({
    queryKey: ['dashboard', 'top-today'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ topProducts: TopProduct[] }>>(
        '/dashboard/top-today'
      )
      return res.data.data.topProducts
    },
    staleTime: 60 * 1000
  })
}

export function useSalesChartData(days = 7) {
  return useQuery({
    queryKey: ['dashboard', 'chart', days],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ chartData: ChartDataPoint[] }>>(
        `/dashboard/chart?days=${days}`
      )
      return res.data.data.chartData
    },
    staleTime: 5 * 60 * 1000
  })
}

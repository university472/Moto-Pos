// frontend/src/hooks/usePurchases.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import api from '@/lib/api'

import type { ApiResponse, PaginatedResponse } from '@/types/api'

// ─────────────────────────────────────────────
// Purchase Item
// ─────────────────────────────────────────────
export interface PurchaseItem {
  product: string

  productName: string

  quantityReceived: number

  purchasePricePerUnit: number

  subtotal: number

  updateProductPrice?: boolean
}

// ─────────────────────────────────────────────
// Purchase
// ─────────────────────────────────────────────
export interface Purchase {
  _id: string

  purchaseNumber: string

  supplier: {
    _id: string
    name: string
    phone: string
  }

  items: PurchaseItem[]

  totalAmount: number

  purchaseDate: string

  notes: string

  createdBy: {
    _id: string
    name: string
  }

  createdAt: string
}

// ─────────────────────────────────────────────
// Create Purchase Payload
// ─────────────────────────────────────────────
export interface CreatePurchasePayload {
  supplier: string

  items: {
    product: string

    quantityReceived: number

    purchasePricePerUnit: number

    updateProductPrice?: boolean
  }[]

  purchaseDate?: string

  notes?: string
}

// ─────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────
export const purchaseKeys = {
  all: ['purchases'] as const,

  list: (page?: number) => [...purchaseKeys.all, 'list', page] as const
}

// ─────────────────────────────────────────────
// Get Purchases
// ─────────────────────────────────────────────
export function usePurchases(page = 1) {
  return useQuery({
    queryKey: purchaseKeys.list(page),

    queryFn: async () => {
      const res = await api.get<
        ApiResponse<
          {
            purchases: Purchase[]
          } & {
            pagination: PaginatedResponse<Purchase>['pagination']
          }
        >
      >(`/purchases?page=${page}&limit=20`)

      return res.data.data
    }
  })
}

// ─────────────────────────────────────────────
// Create Purchase
// ─────────────────────────────────────────────
export function useCreatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePurchasePayload) => {
      const res = await api.post<
        ApiResponse<{
          purchase: Purchase
        }>
      >('/purchases', data)

      return res.data.data.purchase
    },

    onSuccess: (purchase) => {
      // Refresh purchases
      queryClient.invalidateQueries({
        queryKey: purchaseKeys.all
      })

      // Refresh products because stock changed
      queryClient.invalidateQueries({
        queryKey: ['products']
      })

      toast.success('Purchase recorded', {
        description: `${purchase.purchaseNumber} — Stock updated.`
      })
    },

    onError: (error: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Purchase failed', {
        description: error?.response?.data?.message ?? 'Error occurred.'
      })
    }
  })
}

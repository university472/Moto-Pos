// frontend/src/hooks/useSuppliers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import api from '@/lib/api'

import type { ApiResponse } from '@/types/api'

// ─────────────────────────────────────────────
// Supplier Type
// ─────────────────────────────────────────────
export interface Supplier {
  _id: string

  name: string

  contactPerson: string

  phone: string

  address: string

  brands: {
    _id: string
    name: string
  }[]

  notes: string

  isActive: boolean

  createdAt: string
}

// ─────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────
export const supplierKeys = {
  all: ['suppliers'] as const,

  list: () => [...supplierKeys.all, 'list'] as const
}

// ─────────────────────────────────────────────
// Get Suppliers
// ─────────────────────────────────────────────
export function useSuppliers() {
  return useQuery({
    queryKey: supplierKeys.list(),

    queryFn: async () => {
      const res = await api.get<
        ApiResponse<{
          suppliers: Supplier[]
          total: number
        }>
      >('/suppliers')

      return res.data.data
    },

    staleTime: 60 * 1000
  })
}

// ─────────────────────────────────────────────
// Create Supplier
// ─────────────────────────────────────────────
export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: Omit<Supplier, '_id' | 'createdAt' | 'isActive' | 'brands'> & {
        brands: string[]
      }
    ) => {
      const res = await api.post<
        ApiResponse<{
          supplier: Supplier
        }>
      >('/suppliers', data)

      return res.data.data.supplier
    },

    onSuccess: (supplier) => {
      queryClient.invalidateQueries({
        queryKey: supplierKeys.all
      })

      toast.success('Supplier created', {
        description: `"${supplier.name}" added successfully.`
      })
    },

    onError: (error: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed', {
        description: error?.response?.data?.message ?? 'Error occurred.'
      })
    }
  })
}

// ─────────────────────────────────────────────
// Update Supplier
// ─────────────────────────────────────────────
export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string

      data: Partial<Supplier>
    }) => {
      const res = await api.put<
        ApiResponse<{
          supplier: Supplier
        }>
      >(`/suppliers/${id}`, data)

      return res.data.data.supplier
    },

    onSuccess: (supplier) => {
      queryClient.invalidateQueries({
        queryKey: supplierKeys.all
      })

      toast.success('Supplier updated', {
        description: `"${supplier.name}" updated successfully.`
      })
    },

    onError: (error: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed', {
        description: error?.response?.data?.message ?? 'Error occurred.'
      })
    }
  })
}

// ─────────────────────────────────────────────
// Delete Supplier
// ─────────────────────────────────────────────
export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/suppliers/${id}`)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: supplierKeys.all
      })

      toast.success('Supplier deactivated')
    },

    onError: (error: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed', {
        description: error?.response?.data?.message ?? 'Error occurred.'
      })
    }
  })
}

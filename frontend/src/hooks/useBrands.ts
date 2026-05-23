// frontend/src/hooks/useBrands.ts
// TanStack Query hooks for all brand operations.
// Components import these — never call api.ts directly.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { ApiResponse } from '@/types/api'
import { Brand } from '@/types/brand'
import { Toast } from 'radix-ui'

interface BrandsListResponse {
  brands: Brand[]
  total: number
}

// ── Query Keys ─────────────────────────────────────────────────────────────
export const brandKeys = {
  all: ['brands'] as const,
  list: (includeInactive?: boolean) =>
    [...brandKeys.all, 'list', { includeInactive }] as const,
  detail: (id: string) => [...brandKeys.all, 'detail', id] as const
}

// ── GET /brands ────────────────────────────────────────────────────────────
export function useBrands(includeInactive = false) {
  return useQuery({
    queryKey: brandKeys.list(includeInactive),
    queryFn: async () => {
      const response = await api.get<ApiResponse<BrandsListResponse>>(
        `/brands${includeInactive ? '?includeInactive=true' : ''}`
      )
      return response.data.data
    },
    staleTime: 60 * 1000 // Brands don't change often — cache 1 min
  })
}

// ── POST /brands ───────────────────────────────────────────────────────────
export function useCreateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post<ApiResponse<{ brand: Brand }>>(
        '/brands',
        { name }
      )
      return response.data.data.brand
    },
    onSuccess: (newBrand) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all })
      toast.success('Brand created', {
        description: `"${newBrand.name}" has been added successfully.`
      })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to create brand', {
        description:
          error?.response?.data?.message || 'An unexpected error occurred.'
      })
    }
  })
}

// ── PUT /brands/:id ────────────────────────────────────────────────────────
export function useUpdateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.put<ApiResponse<{ brand: Brand }>>(
        `/brands/${id}`,
        { name }
      )
      return response.data.data.brand
    },
    onSuccess: (updatedBrand) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all })
      toast.success('Brand updated', {
        description: `Brand renamed to "${updatedBrand.name}" successfully.`
      })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to update brand', {
        description:
          error?.response?.data?.message || 'An unexpected error occurred.'
      })
    }
  })
}

// ── DELETE /brands/:id ─────────────────────────────────────────────────────
export function useDeleteBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/brands/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all })
      toast.success('Brand deactivated', {
        description: 'Brand has been deactivated successfully.'
      })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to create brand', {
        description:
          error?.response?.data?.message || 'An unexpected error occurred.'
      })
    }
  })
}

// frontend/src/hooks/useCategories.ts
// TanStack Query hooks for all category operations.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import api from '@/lib/api'

import { ApiResponse } from '@/types/api'
import { Category } from '@/types/category'

// ── Types ────────────────────────────────────────────────────────────────
interface CategoriesListResponse {
  categories: Category[]
  total: number
}

// ── Query Keys ───────────────────────────────────────────────────────────
export const categoryKeys = {
  all: ['categories'] as const,

  list: (includeInactive?: boolean) =>
    [...categoryKeys.all, 'list', { includeInactive }] as const,

  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const
}

// ── GET /categories ──────────────────────────────────────────────────────
export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: categoryKeys.list(includeInactive),

    queryFn: async () => {
      const response = await api.get<ApiResponse<CategoriesListResponse>>(
        `/categories${includeInactive ? '?includeInactive=true' : ''}`
      )

      return response.data.data
    },

    staleTime: 60 * 1000
  })
}

// ── POST /categories ─────────────────────────────────────────────────────
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await api.post<ApiResponse<{ category: Category }>>(
        '/categories',
        data
      )

      return response.data.data.category
    },

    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all
      })

      toast.success('Category created', {
        description: `"${newCategory.name}" has been added successfully.`
      })
    },

    onError: (error: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed to create category', {
        description:
          error?.response?.data?.message || 'An unexpected error occurred.'
      })
    }
  })
}

// ── PUT /categories/:id ──────────────────────────────────────────────────
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string
      data: {
        name?: string
        description?: string
      }
    }) => {
      const response = await api.put<ApiResponse<{ category: Category }>>(
        `/categories/${id}`,
        data
      )

      return response.data.data.category
    },

    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all
      })

      toast.success('Category updated', {
        description: `Category updated to "${updatedCategory.name}" successfully.`
      })
    },

    onError: (error: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed to update category', {
        description:
          error?.response?.data?.message || 'An unexpected error occurred.'
      })
    }
  })
}

// ── DELETE /categories/:id ───────────────────────────────────────────────
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`)

      return id
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all
      })

      toast.success('Category deactivated', {
        description: 'Category has been deactivated successfully.'
      })
    },

    onError: (error: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed to deactivate category', {
        description:
          error?.response?.data?.message || 'An unexpected error occurred.'
      })
    }
  })
}

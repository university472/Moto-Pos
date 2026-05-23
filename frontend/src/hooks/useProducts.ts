// frontend/src/hooks/useProducts.ts
// TanStack Query hooks for product management pages.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { ApiResponse, PaginatedResponse } from '@/types/api'
import { Product, ProductFormData, PopulatedProduct } from '@/types/product'

interface ProductListResponse {
  products: PopulatedProduct[]
  pagination: PaginatedResponse<Product>['pagination']
}

interface ProductFilters {
  page?: number
  limit?: number
  q?: string
  brand?: string
  category?: string
  sort?: string
  includeInactive?: boolean
}

export const productKeys = {
  all: ['products'] as const,

  list: (filters: ProductFilters) =>
    [...productKeys.all, 'list', filters] as const,

  detail: (id: string) => [...productKeys.all, 'detail', id] as const
}

export function useProductList(filters: ProductFilters = {}) {
  const params = new URLSearchParams()

  if (filters.page) params.set('page', String(filters.page))

  if (filters.limit) params.set('limit', String(filters.limit))

  if (filters.q) params.set('q', filters.q)

  if (filters.brand) params.set('brand', filters.brand)

  if (filters.category) params.set('category', filters.category)

  if (filters.sort) params.set('sort', filters.sort)

  if (filters.includeInactive) params.set('includeInactive', 'true')

  return useQuery({
    queryKey: productKeys.list(filters),

    queryFn: async () => {
      const res = await api.get<ApiResponse<ProductListResponse>>(
        `/products?${params.toString()}`
      )

      return res.data.data
    },

    placeholderData: (prev) => prev
  })
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),

    queryFn: async () => {
      const res = await api.get<
        ApiResponse<{
          product: PopulatedProduct
        }>
      >(`/products/${id}`)

      return res.data.data.product
    },

    enabled: !!id
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const res = await api.post<ApiResponse<{ product: Product }>>(
        '/products',
        data
      )

      return res.data.data.product
    },

    onSuccess: (p) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all
      })

      toast.success('Product created', {
        description: `"${p.name}" added successfully.`
      })
    },

    onError: (e: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed to create product', {
        description: e?.response?.data?.message ?? 'An error occurred.'
      })
    }
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string
      data: Partial<ProductFormData>
    }) => {
      const res = await api.put<ApiResponse<{ product: Product }>>(
        `/products/${id}`,
        data
      )

      return res.data.data.product
    },

    onSuccess: (p) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all
      })

      toast.success('Product updated', {
        description: `"${p.name}" updated successfully.`
      })
    },

    onError: (e: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed to update product', {
        description: e?.response?.data?.message ?? 'An error occurred.'
      })
    }
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`)

      return id
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all
      })

      toast.success('Product deactivated', {
        description: 'Product removed from active list.'
      })
    },

    onError: (e: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed to deactivate', {
        description: e?.response?.data?.message ?? 'An error occurred.'
      })
    }
  })
}

// frontend/src/hooks/useSettings.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import api from '@/lib/api'

import { toast } from 'sonner'

import type { ApiResponse } from '@/types/api'

/* ──────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */

export interface ShopSettings {
  shopname: string

  shopaddress: string

  shopphone: string

  invoicefooter: string

  taxenabled: boolean

  taxrate: number
}

interface SettingsResponse {
  settings: Record<string, unknown>
}

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

/* ──────────────────────────────────────────────
   NORMALIZE SETTINGS
────────────────────────────────────────────── */

export function normalizeSettings(raw: Record<string, unknown>): ShopSettings {
  return {
    shopname: (raw.shopname ?? raw.shopName ?? '') as string,

    shopaddress: (raw.shopaddress ?? raw.shopAddress ?? '') as string,

    shopphone: (raw.shopphone ?? raw.shopPhone ?? '') as string,

    invoicefooter: (raw.invoicefooter ?? raw.invoiceFooter ?? '') as string,

    taxenabled: Boolean(raw.taxenabled ?? raw.taxEnabled ?? false),

    taxrate: Number(raw.taxrate ?? raw.taxRate ?? 0)
  }
}

/* ──────────────────────────────────────────────
   QUERY KEYS
────────────────────────────────────────────── */

export const settingsKeys = {
  all: ['settings'] as const
}

/* ──────────────────────────────────────────────
   GET SETTINGS
────────────────────────────────────────────── */

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,

    queryFn: async (): Promise<ShopSettings> => {
      const response = await api.get<ApiResponse<SettingsResponse>>('/settings')

      return normalizeSettings(response.data.data.settings)
    },

    staleTime: 5 * 60 * 1000
  })
}

/* ──────────────────────────────────────────────
   UPDATE SETTINGS
────────────────────────────────────────────── */

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<ShopSettings>): Promise<ShopSettings> => {
      const response = await api.put<ApiResponse<SettingsResponse>>(
        '/settings',
        data
      )

      return normalizeSettings(response.data.data.settings)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.all
      })

      toast.success('Settings saved successfully')
    },

    onError: (error: ApiError) => {
      toast.error(error?.response?.data?.message || 'Failed to save settings')
    }
  })
}

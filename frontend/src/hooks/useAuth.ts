// frontend/src/hooks/useAuth.ts
// Uses router.replace() everywhere — no push() to prevent history buildup.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { getDefaultRedirectForRole } from '@/lib/auth'
import { ApiResponse } from '@/types/api'
import { LoginFormData, LoginResponseData } from '@/types/user'

interface UseAuthReturn {
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  user: ReturnType<typeof useAuthStore.getState>['user']
  login: (credentials: LoginFormData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const { user, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (credentials: LoginFormData): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post<ApiResponse<LoginResponseData>>(
        '/auth/login',
        credentials
      )

      const { accessToken, user: loggedInUser } = response.data.data

      // Store in Zustand — this also writes token to localStorage
      setAuth(loggedInUser, accessToken)

      // replace() removes /login from browser history
      // so pressing Back after login doesn't return to login screen
      router.replace(getDefaultRedirectForRole(loggedInUser.role))
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } }
      }
      setError(
        axiosError?.response?.data?.message ||
          'Login failed. Please check your connection and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await api.post('/auth/logout')
    } catch {
      // Clear client state even if server call fails
    } finally {
      storeLogout()
      router.replace('/login')
      setIsLoading(false)
    }
  }

  const clearError = (): void => setError(null)

  return {
    isLoading,
    error,
    isAuthenticated,
    user,
    login,
    logout,
    clearError
  }
}

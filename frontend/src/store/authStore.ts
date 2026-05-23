// frontend/src/store/authStore.ts
// Uses the hydrationStore to signal when localStorage has been read.
// onRehydrateStorage fires after Zustand loads from localStorage.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthUser, UserRole } from '@/types/user'
import { storeToken, removeToken } from '@/lib/auth'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean

  setAuth: (user: AuthUser, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
  logout: () => void

  isAdmin: () => boolean
  isCashier: () => boolean
  getUserRole: () => UserRole | null
  getUserName: () => string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user: AuthUser, accessToken: string) => {
        storeToken(accessToken)
        set({ user, accessToken, isAuthenticated: true })
      },

      setAccessToken: (accessToken: string) => {
        storeToken(accessToken)
        set({ accessToken, isAuthenticated: true })
      },

      logout: () => {
        removeToken()
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      isAdmin: () => get().user?.role === 'admin',

      isCashier: () => {
        const role = get().user?.role
        return role === 'cashier' || role === 'admin'
      },

      getUserRole: () => get().user?.role ?? null,

      getUserName: () => get().user?.name ?? 'User'
    }),
    {
      name: 'moto-pos-auth',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
      }),

      // Only persist user and isAuthenticated — not accessToken
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),

      // ── This fires AFTER localStorage data is loaded into the store ────
      // We use it to signal the hydrationStore that we are ready.
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error('[AuthStore] Hydration failed:', error)
          }
          // Signal hydration complete — dynamically import to avoid circular deps
          import('./hydrationStore').then(({ useHydrationStore }) => {
            useHydrationStore.getState().setHydrated()
          })
        }
      }
    }
  )
)

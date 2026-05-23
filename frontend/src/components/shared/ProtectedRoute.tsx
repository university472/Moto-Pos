'use client'

// frontend/src/components/shared/ProtectedRoute.tsx

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/user'
import { useHydration } from '@/hooks/useHydration'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({
  children,
  allowedRoles
}: ProtectedRouteProps) {
  const router = useRouter()
  const isHydrated = useHydration()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  // ── Derive auth status directly from Zustand store ───────────────────
  // FIX: Do NOT check getStoredToken() here. The token is not persisted
  // in Zustand (partialize excludes it), so after a refresh it will always
  // be null — causing a false "expired" result and the redirect loop.
  // The source of truth is the Zustand store: isAuthenticated + user.
  const isValidSession = isAuthenticated && !!user
  const hasCorrectRole =
    allowedRoles.length === 0 || (!!user && allowedRoles.includes(user.role))

  useEffect(() => {
    // Wait for Zustand to finish loading from localStorage
    if (!isHydrated) return

    if (!isValidSession) {
      router.replace('/login')
      return
    }

    if (!hasCorrectRole && user) {
      if (user.role === 'cashier') {
        router.replace('/pos')
      } else if (user.role === 'admin') {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [isHydrated, isValidSession, hasCorrectRole, user, router])

  // Show spinner while hydrating or a redirect is pending
  if (!isHydrated || !isValidSession || !hasCorrectRole) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: '#0F5469' }}
          />
          <p className="text-sm" style={{ color: '#64748B' }}>
            Loading...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

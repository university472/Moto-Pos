// frontend/src/app/page.tsx
// Simple redirect — HydrationGate ensures Zustand is ready before this renders.

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getDefaultRedirectForRole } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    // HydrationGate ensures this runs only after localStorage is loaded.
    // No race condition possible.
    if (isAuthenticated && user) {
      router.replace(getDefaultRedirectForRole(user.role))
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, user, router])

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

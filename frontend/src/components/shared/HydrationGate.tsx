// frontend/src/components/shared/HydrationGate.tsx
// Renders nothing (spinner) until Zustand has loaded from localStorage.
// Wrap the entire app with this so NO component ever sees stale auth state.

'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useHydrationStore } from '@/store/hydrationStore'

interface HydrationGateProps {
  children: React.ReactNode
}

export function HydrationGate({ children }: HydrationGateProps) {
  const isHydrated = useHydrationStore((state) => state.isHydrated)

  // Fallback: if Zustand onRehydrateStorage never fires (edge case),
  // force-hydrate after 500ms so the app doesn't get stuck.
  const [forcedHydrated, setForcedHydrated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setForcedHydrated(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (!isHydrated && !forcedHydrated) {
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
            Starting Moto POS...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

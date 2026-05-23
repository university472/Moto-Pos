// frontend/src/app/(admin)/error.tsx
// Error boundary for admin route group — keeps sidebar visible on error.
'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface AdminErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminErrorPage({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error('[Admin Error]:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-96 p-8">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: '#FEE2E2' }}
      >
        <AlertTriangle className="h-6 w-6" style={{ color: '#DC2626' }} />
      </div>
      <h2 className="font-semibold text-lg mb-2" style={{ color: '#1E293B' }}>
        Page Error
      </h2>
      <p
        className="text-sm text-center max-w-sm mb-5"
        style={{ color: '#64748B' }}
      >
        {error.message || 'This page encountered an error. Your data is safe.'}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white"
        style={{ backgroundColor: '#0F5469' }}
      >
        <RefreshCw className="h-4 w-4" />
        Reload Page
      </button>
    </div>
  )
}

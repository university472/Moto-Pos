// frontend/src/app/error.tsx
// Next.js 14 root error page — catches unhandled errors at the app level.
'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[Root Error]:', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: '#FEE2E2' }}
      >
        <AlertTriangle className="h-8 w-8" style={{ color: '#DC2626' }} />
      </div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E293B' }}>
        Unexpected Error
      </h1>
      <p
        className="text-sm text-center max-w-md mb-2"
        style={{ color: '#64748B' }}
      >
        Something went wrong in the application. This has been logged.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre
          className="text-xs p-4 rounded-lg mb-6 max-w-xl w-full overflow-auto"
          style={{
            backgroundColor: '#1E293B',
            color: '#F8FAFC'
          }}
        >
          {error.message}
          {error.stack && '\n\n' + error.stack}
        </pre>
      )}
      <button
        onClick={reset}
        className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-lg text-white"
        style={{ backgroundColor: '#0F5469' }}
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  )
}

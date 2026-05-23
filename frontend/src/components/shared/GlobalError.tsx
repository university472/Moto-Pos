// frontend/src/components/shared/GlobalError.tsx
// Reusable error display component — used in pages when data fetch fails.

'use client'

import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'

interface GlobalErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  type?: 'general' | 'network' | 'notFound' | 'unauthorized'
}

const ERROR_CONFIGS = {
  general: {
    icon: AlertTriangle,
    iconColor: '#DC2626',
    iconBg: '#FEE2E2',
    defaultTitle: 'Something went wrong',
    defaultMessage: 'An unexpected error occurred. Please try again.'
  },
  network: {
    icon: WifiOff,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    defaultTitle: 'Connection error',
    defaultMessage:
      'Could not connect to the server. Check if the backend is running.'
  },
  notFound: {
    icon: AlertTriangle,
    iconColor: '#64748B',
    iconBg: '#F8FAFC',
    defaultTitle: 'Not found',
    defaultMessage: 'The requested resource could not be found.'
  },
  unauthorized: {
    icon: AlertTriangle,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    defaultTitle: 'Access denied',
    defaultMessage: 'You do not have permission to view this.'
  }
}

export function GlobalError({
  title,
  message,
  onRetry,
  type = 'general'
}: GlobalErrorProps) {
  const config = ERROR_CONFIGS[type]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: config.iconBg }}
      >
        <Icon className="h-7 w-7" style={{ color: config.iconColor }} />
      </div>
      <h3 className="font-semibold text-base mb-2" style={{ color: '#1E293B' }}>
        {title || config.defaultTitle}
      </h3>
      <p
        className="text-sm text-center max-w-sm mb-6"
        style={{ color: '#64748B' }}
      >
        {message || config.defaultMessage}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#0F5469' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#1A7A96')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#0F5469')
          }
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  )
}

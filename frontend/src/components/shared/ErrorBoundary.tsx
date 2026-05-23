// frontend/src/components/shared/ErrorBoundary.tsx
// React class-based error boundary — catches JS errors in the component tree.
// Renders a friendly error screen instead of a blank white page.

'use client'

import React, { Component, ReactNode } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary caught]:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          className="flex flex-col items-center justify-center min-h-64 p-8 rounded-xl border"
          style={{ backgroundColor: '#FFF5F5', borderColor: '#FCA5A5' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <AlertTriangle className="h-6 w-6" style={{ color: '#DC2626' }} />
          </div>
          <h3
            className="font-semibold text-base mb-1"
            style={{ color: '#1E293B' }}
          >
            Something went wrong
          </h3>
          <p
            className="text-sm text-center mb-4 max-w-sm"
            style={{ color: '#64748B' }}
          >
            {this.state.error?.message ||
              'An unexpected error occurred. Please try refreshing.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#DC2626' }}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

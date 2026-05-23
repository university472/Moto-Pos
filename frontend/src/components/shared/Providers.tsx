// frontend/src/components/shared/Providers.tsx
// UPDATED:
// - Replaced custom toaster with Sonner
// - Keeps HydrationGate protection
// - No functionality loss

'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { Toaster } from 'sonner'

import { HydrationGate } from '@/components/shared/HydrationGate'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,

            retry: 2,

            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 10000),

            refetchOnWindowFocus: true
          },

          mutations: {
            retry: 0
          }
        }
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {/* Prevent app render until Zustand hydration completes */}
      <HydrationGate>{children}</HydrationGate>

      {/* Sonner Toast Provider */}
      <Toaster richColors position="top-right" closeButton />

      {/* React Query Devtools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  )
}

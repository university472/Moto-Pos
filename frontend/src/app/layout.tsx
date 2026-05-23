// frontend/src/app/layout.tsx
// Root layout — wraps the entire app.
// Sets up TanStack Query provider, Toaster, and global metadata.

import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/shared/Providers'

export const metadata: Metadata = {
  title: {
    default: 'Moto POS — Spare Parts Management',
    template: '%s | Moto POS'
  },
  description:
    'Point of Sale and Inventory Management for Motorcycle Spare Parts Shop',
  robots: 'noindex, nofollow' // Internal app — don't index
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

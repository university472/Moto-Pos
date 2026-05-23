// frontend/src/lib/utils.ts
// Utility functions: cn() for Tailwind class merging, PKR formatter, date formatters.

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Sale } from '@/types/sale'

// Shadcn standard: merge Tailwind classes without conflicts
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ── PKR Currency Formatter ────────────────────────────────────────────────
// Usage: formatPKR(24500) → "Rs. 24,500"
export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}

// Usage: formatPKRDecimal(24500.50) → "Rs. 24,500.50"
export function formatPKRDecimal(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

// ── Date Formatters ────────────────────────────────────────────────────────
// Usage: formatDate(new Date()) → "15 Aug 2024"
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Usage: formatDateTime(new Date()) → "15 Aug 2024, 02:35 PM"
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// Usage: formatTime(new Date()) → "02:35 PM"
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// ── String Utilities ──────────────────────────────────────────────────────
// Convert "engine-parts" → "Engine Parts"
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Convert "Honda Air Filter" → "honda-air-filter"
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

// Truncate long text for table cells
export function truncate(text: string, maxLength: number = 40): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

// ── Number Utilities ──────────────────────────────────────────────────────
// Safe percentage calculation (avoids division by zero)
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Pad invoice sequence number: 142 → "00142"
export function padInvoiceNumber(num: number): string {
  return String(num).padStart(5, '0')
}
export function getCashierName(cashier: Sale['cashier']): string {
  if (typeof cashier === 'object' && cashier !== null) {
    return cashier.name
  }

  return 'Cashier'
}

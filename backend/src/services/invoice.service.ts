// backend/src/services/invoice.service.ts
// Invoice number generator — exact logic from Section 10 of the planning report.
// Format: INV-YYYY-NNNNN (e.g., INV-2024-00001 → INV-2024-99999)
//
// CRITICAL RULES (from planning report constraints):
//   - Invoice numbers are NEVER reused
//   - Sequential only — no gaps allowed
//   - Zero-padded to 5 digits
//   - Year resets the counter (INV-2024-99999 → INV-2025-00001)
//
// UPDATED:
//   - Uses atomic MongoDB counter
//   - Race-condition safe for concurrent requests
//   - Safe inside MongoDB transactions/sessions

import mongoose from 'mongoose'
import Sale from '../models/Sale.model'

// ── Invoice Counter Schema ────────────────────────────────────────────────
// Stores yearly sequence counters:
// {
//   _id: "invoice-2026",
//   seq: 142
// }

const invoiceCounterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },

    seq: {
      type: Number,
      default: 0
    }
  },
  {
    versionKey: false,
    timestamps: false
  }
)

// Prevent model overwrite during hot reload/dev
const InvoiceCounter =
  mongoose.models.InvoiceCounter ||
  mongoose.model('InvoiceCounter', invoiceCounterSchema)

// ── Generate next invoice number for the current year ────────────────────
// Uses atomic MongoDB increment to prevent duplicate invoice numbers
// even under heavy concurrent requests.
export async function generateInvoiceNumber(
  session?: mongoose.ClientSession
): Promise<string> {
  const year = new Date().getFullYear()

  const prefix = `INV-${year}-`

  // Atomic counter increment
  const counter = await InvoiceCounter.findOneAndUpdate(
    {
      _id: `invoice-${year}`
    },
    {
      $inc: { seq: 1 }
    },
    {
      upsert: true,
      new: true,
      session,
      setDefaultsOnInsert: true
    }
  )

  const nextSequenceNumber = counter.seq

  // Safety check
  if (nextSequenceNumber > 99999) {
    throw new Error(
      `Invoice number limit reached for year ${year}. Maximum 99,999 invoices per year.`
    )
  }

  // Zero-pad:
  // 1 -> 00001
  // 142 -> 00142
  // 99999 -> 99999
  const paddedNumber = String(nextSequenceNumber).padStart(5, '0')

  return `${prefix}${paddedNumber}`
}

// ── Parse invoice number into parts ──────────────────────────────────────
// Utility used by report aggregations
export function parseInvoiceNumber(invoiceNumber: string): {
  prefix: string
  year: number
  sequence: number
} | null {
  const match = invoiceNumber.match(/^INV-(\d{4})-(\d{5})$/)

  if (!match) {
    return null
  }

  return {
    prefix: 'INV',
    year: parseInt(match[1], 10),
    sequence: parseInt(match[2], 10)
  }
}

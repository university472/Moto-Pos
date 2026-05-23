// frontend/src/app/(cashier)/pos/page.tsx

'use client'

import { useEffect, useCallback, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Loader2, PackageSearch } from 'lucide-react'

import { useQueryClient } from '@tanstack/react-query'

import api from '@/lib/api'

import { useCartStore } from '@/store/cartStore'

import { useProductSearch } from '@/hooks/useProductSearch'

import { productKeys } from '@/hooks/useProducts'

import { SearchBar } from '@/components/pos/SearchBar'
import { ProductCard } from '@/components/pos/ProductCard'
import { Cart } from '@/components/pos/Cart'
import { BillSummary } from '@/components/pos/BillSummary'

import { toast } from 'sonner'

import type { ApiResponse } from '@/types/api'
import type { Sale } from '@/types/sale'

export default function POSPage() {
  const router = useRouter()

  const queryClient = useQueryClient()

  const {
    query,
    setQuery,
    results,
    isLoading,
    isError,
    errorMessage,
    clearResults
  } = useProductSearch(300)

  const { items, clearCart, addItem } = useCartStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // ─────────────────────────────────────────────
  // Enter key quick-add
  // ─────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Enter' &&
        results.length === 1 &&
        query.trim().length > 0 &&
        document.activeElement?.tagName !== 'BUTTON'
      ) {
        const singleResult = results[0]

        if (singleResult.stockQty > 0) {
          addItem(singleResult)

          toast.success(`${singleResult.name} added`, {
            description: `Rs. ${singleResult.salePrice} × 1`
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [results, query, addItem])

  // ─────────────────────────────────────────────
  // Generate Bill
  // ─────────────────────────────────────────────
  const handleGenerateBill = useCallback(async () => {
    if (items.length === 0) {
      return
    }

    const {
      discountType,
      discountValue,
      customerName,
      paymentMethod,
      notes,
      hasOutOfStockItems
    } = useCartStore.getState()

    // Stock validation
    if (hasOutOfStockItems()) {
      toast.error('Stock limit exceeded', {
        description: 'Some items exceed available stock.'
      })

      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        customerName: customerName.trim() || undefined,

        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity
        })),

        discountType,
        discountValue,
        paymentMethod,

        notes: notes ?? ''
      }

      const response = await api.post<
        ApiResponse<{
          sale: Sale
        }>
      >('/sales', payload)

      const { sale } = response.data.data

      // ─────────────────────────────────────────────
      // Invalidate caches after successful sale
      // ─────────────────────────────────────────────
      await queryClient.invalidateQueries({
        queryKey: productKeys.all
      })

      await queryClient.invalidateQueries({
        queryKey: ['inventory']
      })

      await queryClient.invalidateQueries({
        queryKey: ['dashboard']
      })

      toast.success('Bill Generated!', {
        description: `Invoice ${sale.invoiceNumber} — Rs. ${sale.grandTotal.toLocaleString()}`
      })

      // Clear cart before navigation
      clearCart()

      clearResults()

      // Navigate to invoice page
      router.push(`/pos/invoice/${sale._id}`)
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: {
            message?: string
          }
        }
      }

      const message =
        axiosError?.response?.data?.message ||
        'Sale failed. Please try again.'

      toast.error('Sale Failed', {
        description: message
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [
    items,
    clearCart,
    clearResults,
    router,
    queryClient
  ])

  return (
    <div className="pos-page-root flex h-full overflow-hidden">
      {/* ═══════════════════════════════════════
          LEFT PANEL
      ═══════════════════════════════════════ */}
      <div className="pos-left-panel flex flex-col border-r">
        {/* Search */}
        <div className="pos-search-header p-4 border-b">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onClear={clearResults}
            isLoading={isLoading}
          />

          {/* Result Hint */}
          {query && !isLoading && (
            <p className="search-result-hint text-xs mt-2 px-1">
              {results.length === 0
                ? `No products found for "${query}"`
                : `${results.length} result${
                    results.length !== 1 ? 's' : ''
                  } — Press Enter to add single result`}
            </p>
          )}

          {/* Error */}
          {isError && (
            <p className="search-error-text text-xs mt-2 px-1 font-medium">
              ⚠ {errorMessage}
            </p>
          )}
        </div>

        {/* Product Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Empty State */}
          {!query && !isLoading && (
            <div className="empty-search-state flex flex-col items-center justify-center h-full">
              <PackageSearch className="empty-search-icon h-16 w-16 mb-4" />

              <p className="empty-search-title text-sm font-medium">
                Start typing to search products
              </p>

              <p className="empty-search-subtitle text-xs mt-1">
                Search by name, SKU, or brand
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && query && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="search-loading-skeleton h-20 rounded-lg animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Results */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RIGHT PANEL
      ═══════════════════════════════════════ */}
      <div className="pos-right-panel flex flex-col">
        {/* Cart Header */}
        <div className="cart-header px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="cart-title font-semibold text-base">
              Cart
            </h2>

            {items.length > 0 && (
              <span className="cart-badge text-xs font-bold px-2 py-0.5 rounded-full text-white">
                {items.length}
              </span>
            )}
          </div>

          {/* Processing */}
          {isSubmitting && (
            <div className="processing-text flex items-center gap-1.5 text-xs">
              <Loader2 className="h-3 w-3 animate-spin" />

              Processing sale...
            </div>
          )}
        </div>

        {/* Cart Items */}
        <Cart />

        {/* Bill Summary */}
        <BillSummary
          onGenerateBill={handleGenerateBill}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
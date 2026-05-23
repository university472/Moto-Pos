// frontend/src/components/pos/SearchBar.tsx
// POS search input — auto-focused on page load, shows loading spinner,
// clears on Escape key. Calls parent's onQueryChange on every keystroke.

'use client'

import { useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

interface SearchBarProps {
  query: string
  onQueryChange: (q: string) => void
  onClear: () => void
  isLoading: boolean
  placeholder?: string
}

export function SearchBar({
  query,
  onQueryChange,
  onClear,
  isLoading,
  placeholder = 'Search by product name, SKU, or brand...'
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // AUTO-FOCUS on page load (cashier starts typing immediately — Section 7 rule)
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100) // Small delay ensures layout is complete
    return () => clearTimeout(timer)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape: clear search and re-focus
    if (e.key === 'Escape') {
      onClear()
      inputRef.current?.focus()
    }
  }

  return (
    <div className="relative">
      {/* Search icon or spinner */}
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: isLoading ? '#0F5469' : '#94A3B8' }}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Search className="h-5 w-5" />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full pl-12 pr-12 py-4 text-base rounded-xl border-2 outline-none transition-all duration-150"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: query ? '#0F5469' : '#E2E8F0',
          color: '#1E293B',
          fontSize: '16px',
          boxShadow: query ? '0 0 0 3px rgba(15, 84, 105, 0.12)' : 'none'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#0F5469'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15, 84, 105, 0.12)'
        }}
        onBlur={(e) => {
          if (!query) {
            e.currentTarget.style.borderColor = '#E2E8F0'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      />

      {/* Clear button — appears when there's a query */}
      {query && (
        <button
          type="button"
          onClick={() => {
            onClear()
            inputRef.current?.focus()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
          style={{ color: '#94A3B8' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = '#DC2626')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = '#94A3B8')
          }
          tabIndex={-1}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

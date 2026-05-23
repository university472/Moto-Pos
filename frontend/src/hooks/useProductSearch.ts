// frontend/src/hooks/useProductSearch.ts

'use client'

import { useState, useEffect, useRef } from 'react'

import axios from 'axios'

import api from '@/lib/api'

import type { ApiResponse } from '@/types/api'

import type { ProductSearchResult } from '@/types/product'

interface UseProductSearchReturn {
  query: string

  setQuery: (q: string) => void

  results: ProductSearchResult[]

  isLoading: boolean

  isError: boolean

  errorMessage: string

  clearResults: () => void
}

export function useProductSearch(
  debounceMs: number = 300
): UseProductSearchReturn {
  const [query, setQueryState] = useState('')

  const [results, setResults] = useState<ProductSearchResult[]>([])

  const [isSearching, setIsSearching] = useState(false)

  const [isError, setIsError] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')

  // Abort previous requests
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounce timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setQuery = (newQuery: string) => {
    setQueryState(newQuery)

    // Handle empty query immediately
    if (!newQuery.trim()) {
      setResults([])

      setIsSearching(false)

      setIsError(false)

      setErrorMessage('')

      // Cancel running request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    } else {
      // Loading starts from user action
      setIsSearching(true)
    }
  }

  const clearResults = () => {
    setResults([])

    setQueryState('')

    setIsSearching(false)

    setIsError(false)

    setErrorMessage('')

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  useEffect(() => {
    // Ignore empty query
    if (!query.trim()) {
      return
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()

      abortControllerRef.current = controller

      try {
        const response = await api.get<
          ApiResponse<{
            products: ProductSearchResult[]
            query: string
          }>
        >(`/products/search?q=${encodeURIComponent(query.trim())}&limit=10`, {
          signal: controller.signal
        })

        // Ignore aborted requests
        if (controller.signal.aborted) {
          return
        }

        setResults(response.data.data.products)

        setIsError(false)

        setErrorMessage('')
      } catch (error: unknown) {
        // Ignore cancellation
        if (
          axios.isCancel(error) ||
          (error as { name?: string })?.name === 'AbortError' ||
          (error as { name?: string })?.name === 'CanceledError' ||
          (error as { code?: string })?.code === 'ERR_CANCELED'
        ) {
          return
        }

        if (!controller.signal.aborted) {
          setResults([])

          setIsError(true)

          setErrorMessage(
            'Could not connect to system. Check if server is running.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false)
        }
      }
    }, debounceMs)

    // Cleanup timer
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, debounceMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    query,

    setQuery,

    results,

    isLoading: isSearching,

    isError,

    errorMessage,

    clearResults
  }
}

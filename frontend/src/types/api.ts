// frontend/src/types/api.ts
// Standard API response envelope — every backend response follows this shape.
// Matches the format defined in the coding standards section of the planning report.

export interface ApiResponse<T = null> {
  success: boolean
  message: string
  data: T
  error: string | Record<string, string[]> | null
}

// Paginated list wrapper — used by products, sales, purchases list endpoints
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Generic API error shape thrown by Axios interceptor
export interface ApiError {
  message: string
  statusCode: number
  error: string | Record<string, string[]> | null
}

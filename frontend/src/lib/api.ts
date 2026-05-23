// frontend/src/lib/api.ts
// Axios instance with base URL, auth header injection, and auto-refresh interceptor.
// When a 401 is received (access token expired), it silently refreshes and retries.
// This means components never need to handle token refresh manually.

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios'

// const BASE_URL =
// process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
const BASE_URL = '/api/v1' // relative URL, goes through Next.js proxy

// ── Lazy auth store reference ─────────────────────────────────────────────
// Prevents circular dependency issues caused by dynamic imports

type AuthStoreRef = {
  getState: () => {
    setAccessToken: (token: string) => void
    logout: () => void
  }
}

let authStoreRef: AuthStoreRef | null = null

// Call this once from Providers.tsx
export function setAuthStoreRef(store: AuthStoreRef): void {
  authStoreRef = store
}

// ── Create the main Axios instance ────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,

  // Send httpOnly refresh token cookie automatically
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',

    // Prevent stale GET caching
    'Cache-Control': 'no-cache',

    Pragma: 'no-cache'
  },

  // 10 second timeout — fast local network
  timeout: 10000
})

// ── Track whether a token refresh is already in progress ──────────────────
// Prevents multiple simultaneous refresh calls if many requests fail at once

let isRefreshing = false

let failedRequestQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processFailedQueue(error: unknown, token: string | null): void {
  failedRequestQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })

  failedRequestQueue = []
}

// ── Request interceptor: inject access token into every request ───────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read token from localStorage on every request (always fresh)
    const token = localStorage.getItem('accessToken')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },

  (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 → auto-refresh → retry ──────────────

api.interceptors.response.use(
  // Pass through successful responses untouched
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Only attempt refresh on 401 (Unauthorized)
    // and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh attempt for login and refresh endpoints
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')

      if (isAuthEndpoint) {
        return Promise.reject(error)
      }

      // Another refresh is already in progress
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedRequestQueue.push({
            resolve,
            reject
          })
        }).then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }

          return api(originalRequest)
        })
      }

      originalRequest._retry = true

      isRefreshing = true

      try {
        // Call refresh endpoint
        // Uses httpOnly cookie automatically
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true
          }
        )

        const { accessToken } = response.data.data

        // Store new access token
        localStorage.setItem('accessToken', accessToken)

        // Update auth store safely
        if (authStoreRef) {
          authStoreRef.getState().setAccessToken(accessToken)
        }

        // Retry all queued requests
        processFailedQueue(null, accessToken)

        // Retry original failed request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }

        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed — session expired
        processFailedQueue(refreshError, null)

        localStorage.removeItem('accessToken')

        // Logout safely
        if (authStoreRef) {
          authStoreRef.getState().logout()
        }

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api

// import axios from 'axios'

// const api = axios.create({
//   baseURL: '/api/v1',
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// })

// export default api

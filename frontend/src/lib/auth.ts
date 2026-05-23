// frontend/src/lib/auth.ts
// JWT decode helpers and role check utilities.
// Used by ProtectedRoute and useAuth hook.
// NOTE: These are client-side decode only — never trust decoded payload for security.
// All actual security enforcement happens on the backend via verifyToken middleware.

import { JwtPayload, UserRole } from '@/types/user'

// ── Decode JWT payload without verifying signature ─────────────────────────
// We trust the backend to have verified the token — we just need the payload
export function decodeToken(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload) as JwtPayload
  } catch {
    return null
  }
}

// ── Check if a token is expired ────────────────────────────────────────────
// exp is in seconds, Date.now() is in milliseconds
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true
  // Add 10-second buffer to handle clock drift
  return decoded.exp * 1000 < Date.now() - 10000
}

// ── Check if token will expire soon (within 2 minutes) ────────────────────
// Used to proactively refresh before it expires mid-session
export function isTokenExpiringSoon(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true
  const twoMinutesFromNow = Date.now() + 2 * 60 * 1000
  return decoded.exp * 1000 < twoMinutesFromNow
}

// ── Role check helpers ─────────────────────────────────────────────────────
export function isAdmin(role: UserRole | undefined): boolean {
  return role === 'admin'
}

export function isCashier(role: UserRole | undefined): boolean {
  return role === 'cashier' || role === 'admin' // Admin can do cashier things too
}

// ── Get the default redirect path for a role ──────────────────────────────
// Admin → /dashboard, Cashier → /pos (from sitemap Section 5)
export function getDefaultRedirectForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/dashboard'
    case 'cashier':
      return '/pos'
    default:
      return '/login'
  }
}

// ── Read stored token from localStorage ───────────────────────────────────
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

// ── Store token in localStorage ───────────────────────────────────────────
export function storeToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('accessToken', token)
}

// ── Remove token from localStorage ────────────────────────────────────────
export function removeToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
}

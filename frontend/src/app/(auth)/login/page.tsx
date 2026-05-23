'use client'

// frontend/src/app/(auth)/login/page.tsx

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { getDefaultRedirectForRole } from '@/lib/auth'
import { useHydration } from '@/hooks/useHydration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  // FIX: Wait for hydration before reading isAuthenticated.
  // Without this, on first render isAuthenticated=false even if the user
  // IS logged in, so the login form flashes briefly. More critically,
  // if ProtectedRoute redirects here before hydration, this page would
  // immediately redirect back to /pos — causing the infinite loop.
  const isHydrated = useHydration()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const { login, isLoading, error, clearError } = useAuth()

  // Only redirect away from login AFTER hydration is confirmed
  useEffect(() => {
    if (!isHydrated) return
    if (isAuthenticated && user) {
      router.replace(getDefaultRedirectForRole(user.role))
    }
  }, [isHydrated, isAuthenticated, user, router])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  })

  const onSubmit = async (data: LoginFormValues) => {
    clearError()
    await login(data)
  }

  // Show spinner while:
  // 1. Hydration is pending (don't know auth state yet)
  // 2. Already authenticated and waiting for redirect
  if (!isHydrated || (isAuthenticated && user)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: '#0F5469' }}
          />
          <p className="text-sm" style={{ color: '#64748B' }}>
            Loading...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-lg border overflow-hidden"
        style={{ borderColor: '#E2E8F0' }}
      >
        {/* Header */}
        <div
          className="px-8 py-8 text-center"
          style={{ backgroundColor: '#0F5469' }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-white/20 rounded-lg p-2">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Moto POS
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: '#CBD5E1' }}>
            Motorcycle Spare Parts Management
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold" style={{ color: '#1E293B' }}>
              Sign In
            </h2>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>
              Enter your credentials to access the system
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-lg border text-sm font-medium"
              style={{
                backgroundColor: '#FEE2E2',
                borderColor: '#DC2626',
                color: '#DC2626'
              }}
              role="alert"
            >
              ⚠ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#64748B' }}
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                  disabled={isLoading}
                  className="h-11 text-sm"
                  style={{
                    borderColor: errors.username ? '#DC2626' : '#E2E8F0'
                  }}
                  {...register('username')}
                  onChange={(e) => {
                    clearError()
                    register('username').onChange(e)
                  }}
                />
                {errors.username && (
                  <p className="text-xs" style={{ color: '#DC2626' }}>
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#64748B' }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="h-11 text-sm pr-11"
                    style={{
                      borderColor: errors.password ? '#DC2626' : '#E2E8F0'
                    }}
                    {...register('password')}
                    onChange={(e) => {
                      clearError()
                      register('password').onChange(e)
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                    style={{ color: '#64748B' }}
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs" style={{ color: '#DC2626' }}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-semibold text-white mt-2"
                style={{ backgroundColor: isLoading ? '#1A7A96' : '#0F5469' }}
                onMouseEnter={(e) => {
                  if (!isLoading)
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = '#1A7A96'
                }}
                onMouseLeave={(e) => {
                  if (!isLoading)
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = '#0F5469'
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </form>

          {/* Dev credentials */}
          {process.env.NODE_ENV === 'development' && (
            <div
              className="mt-6 p-3 rounded-lg text-xs"
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#64748B'
              }}
            >
              <p className="font-semibold mb-1" style={{ color: '#1E293B' }}>
                Development Credentials
              </p>
              <p>
                Admin: <span className="font-mono">admin / admin123</span>
              </p>
              <p>
                Cashier: <span className="font-mono">cashier / cashier123</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-8 py-4 text-center border-t"
          style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
        >
          <p className="text-xs" style={{ color: '#64748B' }}>
            Internal system — authorized personnel only
          </p>
        </div>
      </div>
    </div>
  )
}

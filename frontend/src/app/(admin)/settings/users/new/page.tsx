// frontend/src/app/(admin)/settings/users/new/page.tsx
// Create a new cashier or admin account.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { z } from 'zod'

import { Users, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import api from '@/lib/api'

import { ApiResponse } from '@/types/api'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'

const newUserSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50)
      .trim(),

    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30)
      .toLowerCase()
      .trim()
      .regex(
        /^[a-z0-9_]+$/,
        'Only lowercase letters, numbers, and underscores'
      ),

    password: z.string().min(6, 'Password must be at least 6 characters'),

    confirmPassword: z.string().min(1, 'Please confirm the password'),

    role: z.enum(['admin', 'cashier'])
  })

  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',

    path: ['confirmPassword']
  })

type NewUserForm = z.infer<typeof newUserSchema>

export default function NewUserPage() {
  const router = useRouter()

  const queryClient = useQueryClient()

  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<NewUserForm>({
    resolver: zodResolver(newUserSchema),

    defaultValues: {
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'cashier'
    }
  })

  const createUser = useMutation({
    mutationFn: async (data: Omit<NewUserForm, 'confirmPassword'>) => {
      const res = await api.post<
        ApiResponse<{
          user: {
            name: string
            username: string
          }
        }>
      >('/users', data)

      return res.data.data.user
    },

    onSuccess: (user) => {
      queryClient.invalidateQueries({
        queryKey: ['users']
      })

      toast.success('User created', {
        description: `${user.name} (@${user.username}) can now log in.`
      })

      router.push('/settings/users')
    },

    onError: (e: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed to create user', {
        description: e?.response?.data?.message ?? 'An error occurred.'
      })
    }
  })

  const onSubmit = async ({ confirmPassword: _, ...data }: NewUserForm) => {
    await createUser.mutateAsync(data)
  }

  return (
    <div className="max-w-lg">
      <div className="page-header">
        <div>
          <Link
            href="/settings/users"
            className="flex items-center gap-1 text-sm mb-1"
            style={{
              color: '#64748B'
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Users
          </Link>

          <h1 className="flex items-center gap-2">
            <Users
              className="h-6 w-6"
              style={{
                color: '#0F5469'
              }}
            />
            Add New User
          </h1>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div
          className="bg-white rounded-lg border p-6 space-y-5"
          style={{
            borderColor: '#E2E8F0'
          }}
        >
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label
              style={{
                color: '#64748B'
              }}
            >
              Full Name *
            </Label>

            <Input
              title="Full name"
              aria-label="Full name"
              placeholder="e.g. Usman Ahmed"
              autoFocus
              {...form.register('name')}
              style={{
                borderColor: form.formState.errors.name ? '#DC2626' : '#E2E8F0'
              }}
            />

            {form.formState.errors.name && (
              <p
                className="text-xs"
                style={{
                  color: '#DC2626'
                }}
              >
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label
              style={{
                color: '#64748B'
              }}
            >
              Username *
            </Label>

            <Input
              title="Username"
              aria-label="Username"
              placeholder="e.g. usman123"
              autoComplete="off"
              {...form.register('username')}
              style={{
                borderColor: form.formState.errors.username
                  ? '#DC2626'
                  : '#E2E8F0'
              }}
            />

            {form.formState.errors.username ? (
              <p
                className="text-xs"
                style={{
                  color: '#DC2626'
                }}
              >
                {form.formState.errors.username.message}
              </p>
            ) : (
              <p
                className="text-xs"
                style={{
                  color: '#94A3B8'
                }}
              >
                Lowercase letters, numbers and underscores only
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label
              style={{
                color: '#64748B'
              }}
            >
              Role *
            </Label>

            <div className="grid grid-cols-2 gap-3">
              {(['cashier', 'admin'] as const).map((role) => {
                const selected = form.watch('role') === role

                return (
                  <label
                    key={role}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                    style={{
                      borderColor: selected ? '#0F5469' : '#E2E8F0',

                      backgroundColor: selected
                        ? 'rgba(15,84,105,0.04)'
                        : '#FFFFFF'
                    }}
                  >
                    <input
                      type="radio"
                      value={role}
                      {...form.register('role')}
                      className="sr-only"
                    />

                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: selected ? '#0F5469' : '#CBD5E1'
                      }}
                    >
                      {selected && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: '#0F5469'
                          }}
                        />
                      )}
                    </div>

                    <div>
                      <p
                        className="text-sm font-semibold capitalize"
                        style={{
                          color: '#1E293B'
                        }}
                      >
                        {role}
                      </p>

                      <p
                        className="text-xs"
                        style={{
                          color: '#94A3B8'
                        }}
                      >
                        {role === 'cashier'
                          ? 'POS access only'
                          : 'Full system access'}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label
              style={{
                color: '#64748B'
              }}
            >
              Password *
            </Label>

            <div className="relative">
              <Input
                title="Password"
                aria-label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                autoComplete="new-password"
                {...form.register('password')}
                className="pr-10"
                style={{
                  borderColor: form.formState.errors.password
                    ? '#DC2626'
                    : '#E2E8F0'
                }}
              />

              <button
                type="button"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{
                  color: '#94A3B8'
                }}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {form.formState.errors.password && (
              <p
                className="text-xs"
                style={{
                  color: '#DC2626'
                }}
              >
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label
              style={{
                color: '#64748B'
              }}
            >
              Confirm Password *
            </Label>

            <Input
              title="Confirm password"
              aria-label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat the password"
              autoComplete="new-password"
              {...form.register('confirmPassword')}
              style={{
                borderColor: form.formState.errors.confirmPassword
                  ? '#DC2626'
                  : '#E2E8F0'
              }}
            />

            {form.formState.errors.confirmPassword && (
              <p
                className="text-xs"
                style={{
                  color: '#DC2626'
                }}
              >
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Link href="/settings/users">
            <Button type="button" variant="outline" className="px-6">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={createUser.isPending}
            className="flex-1 text-white font-bold"
            style={{
              backgroundColor: '#0F5469'
            }}
          >
            {createUser.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create User'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

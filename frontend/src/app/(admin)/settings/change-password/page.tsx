// frontend/src/app/(admin)/settings/change-password/page.tsx
// Change your own password.

'use client'

import { useState } from 'react'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { z } from 'zod'

import { KeyRound, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'

import { useMutation } from '@tanstack/react-query'

import { toast } from 'sonner'

import api from '@/lib/api'

import { useAuthStore } from '@/store/authStore'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'
import {  UseFormRegisterReturn } from 'react-hook-form'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),

    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),

    confirmPassword: z.string().min(1, 'Please confirm your new password')
  })

  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',

    path: ['confirmPassword']
  })

  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password',

    path: ['newPassword']
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

interface PasswordInputProps {
  id: string
  label: string
  show: boolean
  onToggle: () => void
  register: UseFormRegisterReturn
  error?: string
}
function PasswordInput({
  id,
  label,
  show,
  onToggle,
  register,
  error
}: PasswordInputProps) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        style={{
          color: '#64748B'
        }}
      >
        {label}
      </Label>

      <div className="relative">
        <Input
          id={id}
          title={label}
          aria-label={label}
          type={show ? 'text' : 'password'}
          className="pr-10"
          {...register}
          style={{
            borderColor: error ? '#DC2626' : '#E2E8F0'
          }}
        />

        <button
          type="button"
          title={show ? 'Hide password' : 'Show password'}
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{
            color: '#94A3B8'
          }}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && (
        <p
          className="text-xs"
          style={{
            color: '#DC2626'
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default function ChangePasswordPage() {
  const { user } = useAuthStore()

  const [showCurrent, setShowCurrent] = useState(false)

  const [showNew, setShowNew] = useState(false)

  const [success, setSuccess] = useState(false)

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),

    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const changePassword = useMutation({
    mutationFn: async (data: ChangePasswordForm) => {
      await api.patch(`/users/${user?._id}/password`, data)
    },

    onSuccess: () => {
      setSuccess(true)

      form.reset()

      toast.success('Password changed', {
        description: 'Your password has been updated.'
      })
    },

    onError: (e: {
      response?: {
        data?: {
          message?: string
        }
      }
    }) => {
      toast.error('Failed to change password', {
        description: e?.response?.data?.message ?? 'An error occurred.'
      })
    }
  })

  const onSubmit = async (data: ChangePasswordForm) => {
    setSuccess(false)

    await changePassword.mutateAsync(data)
  }

  return (
    <div className="max-w-md">
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <KeyRound
              className="h-6 w-6"
              style={{
                color: '#0F5469'
              }}
            />
            Change Password
          </h1>

          <p
            className="text-sm mt-0.5"
            style={{
              color: '#64748B'
            }}
          >
            Logged in as: <span className="font-medium">@{user?.username}</span>
          </p>
        </div>
      </div>

      {success && (
        <div
          className="mb-5 p-4 rounded-lg border flex items-center gap-3"
          style={{
            backgroundColor: '#DCFCE7',

            borderColor: '#16A34A'
          }}
        >
          <CheckCircle
            className="h-5 w-5 flex-shrink-0"
            style={{
              color: '#16A34A'
            }}
          />

          <p
            className="text-sm font-medium"
            style={{
              color: '#166534'
            }}
          >
            Password changed successfully! Use your new password next time you
            log in.
          </p>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div
          className="bg-white rounded-lg border p-6 space-y-5"
          style={{
            borderColor: '#E2E8F0'
          }}
        >
          <PasswordInput
            id="currentPassword"
            label="Current Password *"
            show={showCurrent}
            onToggle={() => setShowCurrent((p) => !p)}
            register={form.register('currentPassword')}
            error={form.formState.errors.currentPassword?.message}
          />

          <div
            className="border-t pt-4"
            style={{
              borderColor: '#F1F5F9'
            }}
          >
            <PasswordInput
              id="newPassword"
              label="New Password *"
              show={showNew}
              onToggle={() => setShowNew((p) => !p)}
              register={form.register('newPassword')}
              error={form.formState.errors.newPassword?.message}
            />
          </div>

          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password *"
            show={showNew}
            onToggle={() => setShowNew((p) => !p)}
            register={form.register('confirmPassword')}
            error={form.formState.errors.confirmPassword?.message}
          />
        </div>

        <Button
          type="submit"
          disabled={changePassword.isPending}
          className="w-full mt-4 text-white font-bold py-3"
          style={{
            backgroundColor: '#0F5469'
          }}
        >
          {changePassword.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Changing...
            </>
          ) : (
            'Change Password'
          )}
        </Button>
      </form>
    </div>
  )
}

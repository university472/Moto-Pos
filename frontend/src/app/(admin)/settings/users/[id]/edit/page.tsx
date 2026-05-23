// frontend/src/app/(admin)/settings/users/[id]/edit/page.tsx

'use client'

import { useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

import Link from 'next/link'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { z } from 'zod'

import { Users, ArrowLeft, Loader2 } from 'lucide-react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import api from '@/lib/api'

import { toast } from 'sonner'

import type { ApiResponse } from '@/types/api'

import { useAuthStore } from '@/store/authStore'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'

const editUserSchema = z.object({
  name: z.string().min(2, 'Min 2 characters').max(50).trim(),

  role: z.enum(['admin', 'cashier']),

  isActive: z.boolean()
})

type EditUserForm = z.infer<typeof editUserSchema>

interface SystemUser {
  _id: string

  name: string

  username: string

  role: 'admin' | 'cashier'

  isActive: boolean

  createdAt: string
}

export default function EditUserPage() {
  const params = useParams()

  const router = useRouter()

  const queryClient = useQueryClient()

  const { user: currentUser } = useAuthStore()

  const userId = params.id as string

  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId],

    queryFn: async () => {
      const res = await api.get<
        ApiResponse<{
          user: SystemUser
        }>
      >(`/users/${userId}`)

      return res.data.data.user
    },

    enabled: !!userId
  })

  const form = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema)
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,

        role: user.role,

        isActive: user.isActive
      })
    }
  }, [user, form])

  const updateUser = useMutation({
    mutationFn: async (data: EditUserForm) => {
      const res = await api.put<
        ApiResponse<{
          user: SystemUser
        }>
      >(`/users/${userId}`, data)

      return res.data.data.user
    },

    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: ['users']
      })

      toast.success('User updated', {
        description: `${updated.name} updated successfully.`
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
      toast.error('Failed', {
        description: e?.response?.data?.message ?? 'An error occurred.'
      })
    }
  })

  const isSelf = user?._id === currentUser?._id

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-800" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-32">
        <p className="text-sm text-red-600">User not found.</p>

        <Link
          href="/settings/users"
          className="text-sm font-medium mt-2 block text-cyan-800 hover:text-cyan-700"
        >
          Back to Users
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md">
      {/* Header */}
      <div className="page-header">
        <div>
          <Link
            href="/settings/users"
            className="flex items-center gap-1 text-sm mb-1 text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Users
          </Link>

          <h1 className="flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-800" />
            Edit: {user.name}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit((d) => updateUser.mutate(d))}>
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <Label className="text-slate-500">Username (cannot change)</Label>

            <Input
              title="Username"
              aria-label="Username"
              value={user.username}
              disabled
              className="font-mono bg-gray-50 border-slate-200"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-slate-500">Full Name *</Label>

            <Input
              title="Full name"
              aria-label="Full name"
              placeholder="Enter full name"
              {...form.register('name')}
              className={
                form.formState.errors.name
                  ? 'border-red-600'
                  : 'border-slate-200'
              }
            />

            {form.formState.errors.name && (
              <p className="text-xs text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-slate-500">
              Role
              {isSelf && (
                <span className="text-xs ml-1 text-slate-400">
                  (cannot change your own role)
                </span>
              )}
            </Label>

            <select
              title="User role"
              aria-label="User role"
              {...form.register('role')}
              disabled={isSelf}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-slate-200 outline-none text-slate-800"
            >
              <option value="cashier">Cashier</option>

              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              title="Account active"
              aria-label="Account active"
              {...form.register('isActive')}
              disabled={isSelf}
              className="w-4 h-4 cursor-pointer accent-cyan-800"
            />

            <Label htmlFor="isActive" className="cursor-pointer text-slate-800">
              Account Active
              {isSelf && (
                <span className="text-xs ml-2 text-slate-400">
                  (cannot deactivate yourself)
                </span>
              )}
            </Label>
          </div>

          {/* Change password note */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              To change this user&#39s password,
              <Link
                href="/settings/change-password"
                className="underline ml-1 text-cyan-800 hover:text-cyan-700"
              >
                use the Change Password page
              </Link>{' '}
              or ask the admin to reset it via API.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Link href="/settings/users">
            <Button
              type="button"
              variant="outline"
              className="px-6"
              title="Cancel"
              aria-label="Cancel"
            >
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={updateUser.isPending}
            title="Save changes"
            aria-label="Save changes"
            className="flex-1 text-white font-bold bg-cyan-800 hover:bg-cyan-700"
          >
            {updateUser.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

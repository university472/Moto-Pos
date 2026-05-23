// frontend/src/app/(admin)/settings/users/page.tsx
// Full user management — list all users, add cashier, edit, deactivate, reactivate.

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'

import {
  Users,
  Plus,
  Pencil,
  UserX,
  UserCheck,
  Loader2,
  ShieldCheck,
  User
} from 'lucide-react'

import { toast } from 'sonner'

import api from '@/lib/api'
import { ApiResponse } from '@/types/api'

import { useAuthStore } from '@/store/authStore'
import { formatDateTime } from '@/lib/utils'

import { Button } from '@/components/ui/button'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface SystemUser {
  _id: string
  name: string
  username: string
  role: 'admin' | 'cashier'
  isActive: boolean
  createdAt: string
}

function useUsers() {
  return useQuery({
    queryKey: ['users', 'list'],

    queryFn: async () => {
      const res =
        await api.get<
          ApiResponse<{
            users: SystemUser[]
            total: number
          }>
        >('/users?includeInactive=true')

      return res.data.data
    },

    staleTime: 30 * 1000
  })
}

export default function UsersPage() {
  const { data, isLoading } =
    useUsers()

  const queryClient =
    useQueryClient()

  const {
    user: currentUser
  } = useAuthStore()

  const [
    deactivatingUser,
    setDeactivatingUser
  ] =
    useState<SystemUser | null>(
      null
    )

  const [
    reactivatingUser,
    setReactivatingUser
  ] =
    useState<SystemUser | null>(
      null
    )

  // Deactivate mutation
  const deactivate = useMutation({
    mutationFn: async (
      id: string
    ) => {
      await api.delete(
        `/users/${id}`
      )
    },

    onSuccess: () => {
      queryClient.invalidateQueries(
        {
          queryKey: ['users']
        }
      )

      toast.success(
        'User deactivated',
        {
          description:
            'The user can no longer log in.'
        }
      )

      setDeactivatingUser(null)
    },

    onError: (
      e: {
        response?: {
          data?: {
            message?: string
          }
        }
      }
    ) => {
      toast.error('Failed', {
        description:
          e?.response?.data
            ?.message ??
          'Could not deactivate user.'
      })
    }
  })

  // Reactivate mutation
  const reactivate =
    useMutation({
      mutationFn: async (
        id: string
      ) => {
        await api.patch(
          `/users/${id}/reactivate`
        )
      },

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: ['users']
          }
        )

        toast.success(
          'User reactivated',
          {
            description:
              'The user can now log in again.'
          }
        )

        setReactivatingUser(null)
      },

      onError: (
        e: {
          response?: {
            data?: {
              message?: string
            }
          }
        }
      ) => {
        toast.error('Failed', {
          description:
            e?.response?.data
              ?.message ??
            'Could not reactivate user.'
        })
      }
    })

  const users =
    data?.users ?? []

  const adminUsers =
    users.filter(
      (u) => u.role === 'admin'
    )

  const cashierUsers =
    users.filter(
      (u) => u.role === 'cashier'
    )

  const UserRow = ({
    user
  }: {
    user: SystemUser
  }) => {
    const isSelf =
      user._id === currentUser?._id

    return (
      <tr
        key={user._id}
        style={{
          opacity: user.isActive
            ? 1
            : 0.6
        }}
      >
        <td>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{
                backgroundColor:
                  user.role ===
                  'admin'
                    ? '#0F5469'
                    : '#64748B'
              }}
            >
              {user.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <p
                className="font-medium text-sm"
                style={{
                  color:
                    '#1E293B'
                }}
              >
                {user.name}

                {isSelf && (
                  <span
                    className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor:
                        'rgba(15,84,105,0.1)',
                      color:
                        '#0F5469'
                    }}
                  >
                    You
                  </span>
                )}
              </p>

              <p
                className="text-xs font-mono"
                style={{
                  color:
                    '#94A3B8'
                }}
              >
                @{user.username}
              </p>
            </div>
          </div>
        </td>

        <td>
          <span
            className="flex items-center gap-1.5 text-xs font-semibold w-fit px-2.5 py-1 rounded-full"
            style={{
              backgroundColor:
                user.role ===
                'admin'
                  ? 'rgba(15,84,105,0.1)'
                  : '#F8FAFC',

              color:
                user.role ===
                'admin'
                  ? '#0F5469'
                  : '#64748B',

              border: `1px solid ${
                user.role ===
                'admin'
                  ? 'rgba(15,84,105,0.2)'
                  : '#E2E8F0'
              }`
            }}
          >
            {user.role ===
            'admin' ? (
              <>
                <ShieldCheck className="h-3 w-3" />
                Admin
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                Cashier
              </>
            )}
          </span>
        </td>

        <td>
          <span
            className={
              user.isActive
                ? 'badge-in-stock'
                : 'badge-out-stock'
            }
          >
            {user.isActive
              ? 'Active'
              : 'Inactive'}
          </span>
        </td>

        <td
          className="text-sm"
          style={{
            color: '#64748B'
          }}
        >
          {formatDateTime(
            user.createdAt
          )}
        </td>

        <td>
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/settings/users/${user._id}/edit`}
              title="Edit user"
              className="p-1.5 rounded-md transition-colors"
              style={{
                color: '#64748B'
              }}
            >
              <Pencil className="h-4 w-4" />
            </Link>

            {user.isActive ? (
              <button
                onClick={() =>
                  setDeactivatingUser(
                    user
                  )
                }
                disabled={isSelf}
                title={
                  isSelf
                    ? 'Cannot deactivate your own account'
                    : 'Deactivate user'
                }
                className="p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  color:
                    '#64748B'
                }}
              >
                <UserX className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() =>
                  setReactivatingUser(
                    user
                  )
                }
                title="Reactivate user"
                className="p-1.5 rounded-md transition-colors"
                style={{
                  color:
                    '#64748B'
                }}
              >
                <UserCheck className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="flex items-center gap-2">
            <Users
              className="h-6 w-6"
              style={{
                color: '#0F5469'
              }}
            />

            User Management
          </h1>

          <p
            className="text-sm mt-0.5"
            style={{
              color: '#64748B'
            }}
          >
            Manage admin and
            cashier accounts
          </p>
        </div>

        <Link href="/settings/users/new">
          <Button
            className="flex items-center gap-2 text-white font-semibold"
            style={{
              backgroundColor:
                '#0F5469'
            }}
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-lg border overflow-hidden"
        style={{
          borderColor: '#E2E8F0'
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              className="h-6 w-6 animate-spin"
              style={{
                color: '#0F5469'
              }}
            />

            <span
              className="ml-2 text-sm"
              style={{
                color: '#64748B'
              }}
            >
              Loading users...
            </span>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                  />
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Deactivate */}
      <AlertDialog
        open={
          deactivatingUser !==
          null
        }
        onOpenChange={(o) => {
          if (!o)
            setDeactivatingUser(
              null
            )
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deactivate User
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you
              want to deactivate{' '}
              <strong>
                {
                  deactivatingUser?.name
                }
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() =>
                deactivatingUser &&
                deactivate.mutate(
                  deactivatingUser._id
                )
              }
              className="text-white"
              style={{
                backgroundColor:
                  '#DC2626'
              }}
            >
              {deactivate.isPending
                ? 'Deactivating...'
                : 'Yes, Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate */}
      <AlertDialog
        open={
          reactivatingUser !==
          null
        }
        onOpenChange={(o) => {
          if (!o)
            setReactivatingUser(
              null
            )
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Reactivate User
            </AlertDialogTitle>

            <AlertDialogDescription>
              Reactivate{' '}
              <strong>
                {
                  reactivatingUser?.name
                }
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() =>
                reactivatingUser &&
                reactivate.mutate(
                  reactivatingUser._id
                )
              }
              className="text-white"
              style={{
                backgroundColor:
                  '#16A34A'
              }}
            >
              {reactivate.isPending
                ? 'Reactivating...'
                : 'Yes, Reactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
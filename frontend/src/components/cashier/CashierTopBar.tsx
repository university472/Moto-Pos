// frontend/src/components/cashier/CashierTopBar.tsx
// POS top bar with live clock, today's sale counter, logout,
// and cashier change-password shortcut.

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

import { useQuery } from '@tanstack/react-query'

import {
  LogOut,
  ShoppingBag,
  Clock,
  ShoppingCart,
  KeyRound
} from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/store/cartStore'

import api from '@/lib/api'

import { ApiResponse } from '@/types/api'

// Fetch today's transaction count
function useTodayStats() {
  return useQuery({
    queryKey: ['cashier', 'today-stats'],

    queryFn: async () => {
      const res = await api.get<
        ApiResponse<{
          summary: {
            todayTransactions: number
            todayRevenue: number
          }
        }>
      >('/sales/today-summary')

      return res.data.data.summary
    },

    refetchInterval: 60 * 1000,

    staleTime: 30 * 1000
  })
}

export function CashierTopBar() {
  const { getUserName } = useAuthStore()

  const { logout, isLoading: isLoggingOut } = useAuth()

  const { getItemCount } = useCartStore()

  const { data: todayStats } = useTodayStats()

  const cartCount = getItemCount()

  // Live clock
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString('en-PK', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      )
    }

    updateTime()

    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 no-print"
      style={{ backgroundColor: '#0F5469' }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <ShoppingBag className="h-4 w-4 text-white" />
        </div>

        <div>
          <span className="text-white font-bold text-base leading-none">
            Moto POS
          </span>

          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF'
            }}
          >
            POS
          </span>
        </div>
      </div>

      {/* Center: Stats */}
      <div className="flex items-center gap-6">
        {/* Clock */}
        <div className="flex items-center gap-1.5">
          <Clock
            className="h-3.5 w-3.5"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          />

          <span className="text-sm font-mono font-semibold text-white">
            {time}
          </span>
        </div>

        {/* Today's bills */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <ShoppingCart
            className="h-3.5 w-3.5"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          />

          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Today:
          </span>

          <span className="text-sm font-bold text-white font-numeric">
            {todayStats?.todayTransactions ?? 0}
          </span>

          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            bills
          </span>
        </div>

        {/* Cart item count */}
        {cartCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: 'rgba(22,163,74,0.25)' }}
          >
            <span
              className="text-xs"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              Cart:
            </span>

            <span className="text-sm font-bold text-white font-numeric">
              {cartCount}
            </span>

            <span
              className="text-xs"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              items
            </span>
          </div>
        )}
      </div>

      {/* Right: User + Actions */}
      <div className="flex items-center gap-3">
        {/* User */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#FFFFFF'
            }}
          >
            {getUserName().charAt(0).toUpperCase()}
          </div>

          <span
            className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            {getUserName()}
          </span>
        </div>

        {/* Change Password */}
        <Link
          href="/pos/change-password"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.85)'
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              'rgba(255,255,255,0.2)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              'rgba(255,255,255,0.1)')
          }
        >
          <KeyRound className="h-3.5 w-3.5" />
          Password
        </Link>

        {/* Logout */}
        <button
          onClick={logout}
          disabled={isLoggingOut}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.85)'
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'rgba(255,255,255,0.2)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'rgba(255,255,255,0.1)')
          }
        >
          <LogOut className="h-3.5 w-3.5" />

          {isLoggingOut ? '...' : 'Logout'}
        </button>
      </div>
    </header>
  )
}

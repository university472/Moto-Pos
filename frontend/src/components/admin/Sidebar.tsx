// frontend/src/components/admin/Sidebar.tsx
// Full admin sidebar — updated with Returns link.
// Inline styles removed.
// Accessibility + hover issues fixed.

'use client'

import Link from 'next/link'

import { usePathname } from 'next/navigation'

import {
  KeyRound,
  RotateCcw,
  LayoutDashboard,
  Package,
  Tag,
  Layers,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  BarChart2,
  Settings,
  LogOut,
  ShoppingBag
} from 'lucide-react'

import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/hooks/useAuth'

import { useAuthStore } from '@/store/authStore'

import api from '@/lib/api'

import { ApiResponse } from '@/types/api'

import { cn } from '@/lib/utils'

// ── Low-stock count query ──────────────────────────────────────────────────
function useLowStockCount() {
  return useQuery({
    queryKey: ['low-stock-count'],

    queryFn: async () => {
      const response = await api.get<
        ApiResponse<{
          count: number
        }>
      >('/products/low-stock')

      return response.data.data.count
    },

    refetchInterval: 5 * 60 * 1000,

    staleTime: 3 * 60 * 1000
  })
}

// ── Nav item shape ─────────────────────────────────────────────────────────
interface NavItem {
  label: string

  href: string

  icon: React.ElementType

  badge?: number

  exact?: boolean
}

// ── Nav sections ───────────────────────────────────────────────────────────
function useNavItems(lowStockCount: number): {
  section: string
  items: NavItem[]
}[] {
  return [
    {
      section: 'Main',

      items: [
        {
          label: 'Dashboard',

          href: '/dashboard',

          icon: LayoutDashboard,

          exact: true
        }
      ]
    },

    {
      section: 'Catalogue',

      items: [
        {
          label: 'Products',
          href: '/products',
          icon: Package
        },

        {
          label: 'Brands',
          href: '/brands',
          icon: Tag
        },

        {
          label: 'Categories',
          href: '/categories',
          icon: Layers
        }
      ]
    },

    {
      section: 'Operations',

      items: [
        {
          label: 'POS / New Sale',
          href: '/pos',
          icon: ShoppingCart
        },

        {
          label: 'Sales History',
          href: '/sales',
          icon: TrendingUp
        },

        {
          label: 'Purchases',
          href: '/purchases',
          icon: Truck
        },

        {
          label: 'Returns',
          href: '/returns',
          icon: RotateCcw
        },

        {
          label: 'Suppliers',
          href: '/suppliers',
          icon: Users
        }
      ]
    },

    {
      section: 'Inventory',

      items: [
        {
          label: 'Stock Overview',

          href: '/inventory',

          icon: ShoppingBag,

          badge: lowStockCount > 0 ? lowStockCount : undefined
        }
      ]
    },

    {
      section: 'Reports',

      items: [
        {
          label: 'Reports Hub',
          href: '/reports',
          icon: BarChart2
        },

        {
          label: 'Daily Sales',
          href: '/reports/daily',
          icon: BarChart2
        },

        {
          label: 'Monthly',
          href: '/reports/monthly',
          icon: BarChart2
        },

        {
          label: 'Profit / Loss',
          href: '/reports/profit',
          icon: BarChart2
        }
      ]
    },

    {
      section: 'System',

      items: [
        {
          label: 'Users',
          href: '/settings/users',
          icon: Users
        },

        {
          label: 'Change Password',
          href: '/settings/change-password',
          icon: KeyRound
        },

        {
          label: 'Settings',
          href: '/settings',
          icon: Settings
        }
      ]
    }
  ]
}

export function Sidebar() {
  const pathname = usePathname()

  const { logout, isLoading: isLoggingOut } = useAuth()

  const { getUserName } = useAuthStore()

  const { data: lowStockCount = 0 } = useLowStockCount()

  const navSections = useNavItems(lowStockCount)

  // ── Active route check ────────────────────────────────────────────────
  const isActive = (href: string, exact = false): boolean => {
    if (exact) {
      return pathname === href
    }

    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-slate-900">
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-cyan-800">
          <ShoppingBag className="h-5 w-5 text-white" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">Moto POS</p>

          <p className="text-xs truncate text-slate-500">Admin Panel</p>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2 text-slate-600">
              {section.section}
            </p>

            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact)

                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
                        active
                          ? 'bg-cyan-800 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />

                      <span className="flex-1 truncate">{item.label}</span>

                      {/* Badge */}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center bg-amber-500 text-slate-900">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── User / Logout ───────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md mb-2 bg-slate-800">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white bg-cyan-800">
            {getUserName().charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {getUserName()}
            </p>

            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>

        <button
          title="Logout"
          aria-label="Logout"
          onClick={logout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-150"
        >
          <LogOut className="h-4 w-4" />

          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  )
}

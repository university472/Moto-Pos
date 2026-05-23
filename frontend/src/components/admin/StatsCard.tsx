// frontend/src/components/admin/StatsCard.tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  iconBg: string
  trend?: { value: number; label: string; positive?: boolean }
  isLoading?: boolean
  className?: string
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  isLoading,
  className
}: StatsCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: '#64748B' }}
          >
            {label}
          </p>
          {isLoading ? (
            <div
              className="h-8 w-32 rounded animate-pulse"
              style={{ backgroundColor: '#E2E8F0' }}
            />
          ) : (
            <p
              className="text-2xl font-bold font-numeric leading-none"
              style={{ color: '#1E293B' }}
            >
              {value}
            </p>
          )}
          {trend && !isLoading && (
            <p
              className="text-xs mt-2 font-medium"
              style={{ color: trend.positive ? '#16A34A' : '#DC2626' }}
            >
              {trend.positive ? '▲' : '▼'} {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div
          className="p-3 rounded-xl flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  )
}

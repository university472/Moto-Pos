// frontend/src/app/(cashier)/layout.tsx — UPDATED: uses real CashierTopBar
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { CashierTopBar } from '@/components/cashier/CashierTopBar'

export default function CashierLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'cashier']}>
      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <CashierTopBar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </ProtectedRoute>
  )
}

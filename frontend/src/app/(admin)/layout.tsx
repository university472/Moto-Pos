// frontend/src/app/(admin)/layout.tsx
// UPDATED:
// - Added no-print sidebar wrapper
// - Added mobile desktop-required warning screen

import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <>
        {/* ── Mobile Warning Screen ───────────────────────────── */}
        <div className="md:hidden flex items-center justify-center h-screen p-8 text-center">
          <div>
            <p className="font-bold text-lg mb-2" style={{ color: '#1E293B' }}>
              Desktop Required
            </p>

            <p className="text-sm" style={{ color: '#64748B' }}>
              Moto POS is designed for desktop use. Please open on a computer or
              laptop.
            </p>
          </div>
        </div>

        {/* ── Desktop Layout ─────────────────────────────────── */}
        <div
          className="hidden md:flex h-screen overflow-hidden"
          style={{ backgroundColor: '#F8FAFC' }}
        >
          {/* Sidebar - Hidden During Print */}
          <aside className="w-64 flex-shrink-0 hidden md:flex flex-col no-print">
            <Sidebar />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </>
    </ProtectedRoute>
  )
}

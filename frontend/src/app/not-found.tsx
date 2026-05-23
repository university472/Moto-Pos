// frontend/src/app/not-found.tsx
// Custom 404 page.
import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'rgba(15,84,105,0.1)' }}
      >
        <Search className="h-8 w-8" style={{ color: '#0F5469' }} />
      </div>
      <p
        className="text-6xl font-black mb-4 font-numeric"
        style={{ color: '#E2E8F0' }}
      >
        404
      </p>
      <h1 className="text-xl font-bold mb-2" style={{ color: '#1E293B' }}>
        Page Not Found
      </h1>
      <p className="text-sm mb-6" style={{ color: '#64748B' }}>
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white"
        style={{ backgroundColor: '#0F5469' }}
      >
        Back to Home
      </Link>
    </div>
  )
}

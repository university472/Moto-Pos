// frontend/src/components/shared/PageSkeleton.tsx
// Full-page loading skeleton — prevents layout shifts on first load.

export function PageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Page header skeleton */}
      <div
        className="flex items-center justify-between mb-6 pb-4 border-b"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div>
          <div
            className="h-7 w-40 rounded-lg mb-2"
            style={{ backgroundColor: '#E2E8F0' }}
          />
          <div
            className="h-4 w-56 rounded"
            style={{ backgroundColor: '#F1F5F9' }}
          />
        </div>
        <div
          className="h-10 w-28 rounded-lg"
          style={{ backgroundColor: '#E2E8F0' }}
        />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border p-5"
            style={{ borderColor: '#E2E8F0' }}
          >
            <div
              className="h-3 w-20 rounded mb-3"
              style={{ backgroundColor: '#F1F5F9' }}
            />
            <div
              className="h-8 w-28 rounded-lg"
              style={{ backgroundColor: '#E2E8F0' }}
            />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div
        className="bg-white rounded-lg border overflow-hidden"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: '#E2E8F0' }}>
          <div
            className="h-4 w-48 rounded"
            style={{ backgroundColor: '#F1F5F9' }}
          />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0"
            style={{ borderColor: '#F8FAFC' }}
          >
            <div
              className="h-4 w-40 rounded"
              style={{ backgroundColor: '#F1F5F9' }}
            />
            <div
              className="h-4 w-24 rounded"
              style={{ backgroundColor: '#F1F5F9' }}
            />
            <div
              className="h-4 w-32 rounded ml-auto"
              style={{ backgroundColor: '#F1F5F9' }}
            />
            <div
              className="h-6 w-16 rounded-full"
              style={{ backgroundColor: '#F1F5F9' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

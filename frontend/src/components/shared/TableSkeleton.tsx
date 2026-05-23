// frontend/src/components/shared/TableSkeleton.tsx
// Lightweight skeleton just for table areas inside loaded pages.

interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse">
      {/* Header row */}
      <div
        className="flex gap-4 px-4 py-3 border-b"
        style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded flex-1"
            style={{ backgroundColor: '#E2E8F0' }}
          />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 px-4 py-3.5 border-b last:border-b-0"
          style={{ borderColor: '#F8FAFC' }}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-4 rounded flex-1"
              style={{
                backgroundColor: '#F1F5F9',
                maxWidth:
                  colIdx === 0
                    ? '180px'
                    : colIdx === cols - 1
                      ? '80px'
                      : undefined
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

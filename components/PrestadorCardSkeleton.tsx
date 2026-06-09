export function PrestadorCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-outline-variant bg-white p-4 shadow-card animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 flex-shrink-0 rounded-full bg-surface-low" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-surface-low" />
          <div className="h-3 w-1/3 rounded-full bg-surface-low" />
          <div className="h-3 w-1/2 rounded bg-surface-low" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <div className="h-3 w-24 rounded bg-surface-low" />
      </div>
      <div className="mt-4 h-9 w-full rounded-lg bg-surface-low" />
    </div>
  )
}

export function PrestadorCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PrestadorCardSkeleton key={i} />
      ))}
    </div>
  )
}

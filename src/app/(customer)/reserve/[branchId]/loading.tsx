export default function ReserveLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Branch info skeleton */}
      <div className="mb-8">
        <div className="h-7 w-48 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      </div>

      {/* Date picker skeleton */}
      <div className="mb-6">
        <div className="h-5 w-24 bg-muted animate-pulse rounded mb-3" />
        <div className="h-10 w-full max-w-xs bg-muted animate-pulse rounded" />
      </div>

      {/* Time slots skeleton */}
      <div className="mb-6">
        <div className="h-5 w-32 bg-muted animate-pulse rounded mb-3" />
        <div className="grid grid-cols-4 gap-2 max-w-md">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>

      {/* Button skeleton */}
      <div className="h-10 w-full max-w-xs bg-muted animate-pulse rounded" />
    </div>
  );
}

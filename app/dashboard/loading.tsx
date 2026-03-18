export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-slate-200" />

      {/* Tracked count skeleton */}
      <div className="mt-8 mb-4 flex items-center gap-2">
        <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[290px] rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col"
          >
            <div className="h-[160px] w-full animate-pulse bg-slate-200" />
            <div className="flex flex-col gap-3 p-4 flex-1">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

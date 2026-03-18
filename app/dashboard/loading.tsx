export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Header skeleton */}
      <div className="border-b border-slate-100 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Heading skeleton */}
        <div className="mb-8">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 h-12 w-full max-w-2xl animate-pulse rounded-xl bg-slate-200" />
        </div>

        {/* Cards skeleton */}
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[290px] rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col"
              >
                <div className="h-[160px] w-full animate-pulse bg-slate-100" />
                <div className="flex flex-col gap-3 p-4 flex-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

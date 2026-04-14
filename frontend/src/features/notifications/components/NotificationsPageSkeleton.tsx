export default function NotificationsPageSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-bg p-8 animate-pulse">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="h-9 w-48 bg-neutral-border rounded-lg" />
            <div className="h-7 w-40 bg-neutral-border rounded-full" />
          </div>
          <div className="h-4 w-72 bg-neutral-border rounded" />
        </div>

        {/* Panel de resumen */}
        <section className="rounded-3xl border border-neutral-border bg-neutral-surface p-6 shadow-sm space-y-4">
          <div className="h-5 w-40 bg-neutral-border rounded" />
          <div className="h-3 w-96 bg-neutral-border rounded" />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {/* Red card skeleton */}
            <div className="rounded-2xl border border-neutral-border p-4">
              <div className="h-3 w-20 bg-neutral-border rounded mb-2" />
              <div className="h-8 w-12 bg-neutral-border rounded" />
              <div className="h-2.5 w-48 bg-neutral-border rounded mt-3" />
            </div>
            {/* Green card skeleton */}
            <div className="rounded-2xl border border-neutral-border p-4">
              <div className="h-3 w-20 bg-neutral-border rounded mb-2" />
              <div className="h-8 w-12 bg-neutral-border rounded" />
              <div className="h-2.5 w-40 bg-neutral-border rounded mt-3" />
            </div>
          </div>
        </section>

        {/* Filters section */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-4 w-48 bg-neutral-border rounded" />
          <div className="h-10 w-56 bg-neutral-border rounded-lg" />
        </section>

        {/* Notifications grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-border bg-neutral-surface p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-neutral-border rounded" />
                  <div className="h-3 w-48 bg-neutral-border rounded" />
                </div>
                <div className="w-8 h-8 bg-neutral-border rounded-lg flex-shrink-0 ml-2" />
              </div>

              <div className="space-y-2">
                <div className="h-3 w-40 bg-neutral-border rounded" />
                <div className="h-3 w-44 bg-neutral-border rounded" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="h-2.5 w-24 bg-neutral-border rounded" />
                <div className="h-9 w-32 bg-neutral-border rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

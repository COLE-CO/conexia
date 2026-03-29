export default function CashFlowSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-5 shadow-sm min-h-[148px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-border" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-neutral-border rounded" />
              <div className="h-6 w-40 bg-neutral-border rounded" />
            </div>
          </div>
          <div className="h-3 w-56 bg-neutral-border rounded" />
        </article>

        <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-5 shadow-sm min-h-[148px] lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded bg-neutral-border" />
            <div className="h-4 w-32 bg-neutral-border rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="rounded-xl border border-neutral-border p-3 bg-white space-y-2">
              <div className="h-3 w-24 bg-neutral-border rounded" />
              <div className="h-5 w-28 bg-neutral-border rounded" />
              <div className="h-3 w-20 bg-neutral-border rounded" />
            </div>
            <div className="rounded-xl border border-neutral-border p-3 bg-white space-y-2">
              <div className="h-3 w-24 bg-neutral-border rounded" />
              <div className="h-5 w-28 bg-neutral-border rounded" />
              <div className="h-3 w-20 bg-neutral-border rounded" />
            </div>
            <div className="rounded-xl border border-neutral-border p-3 bg-white space-y-2 hidden xl:block">
              <div className="h-3 w-24 bg-neutral-border rounded" />
              <div className="h-5 w-28 bg-neutral-border rounded" />
              <div className="h-3 w-20 bg-neutral-border rounded" />
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm min-h-[468px] xl:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded bg-neutral-border" />
            <div className="h-4 w-28 bg-neutral-border rounded" />
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="h-3 w-28 bg-neutral-border rounded" />
              <div className="h-10 w-full bg-neutral-border/70 rounded-lg" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-20 bg-neutral-border rounded" />
              <div className="h-20 w-full bg-neutral-border/70 rounded-lg" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-24 bg-neutral-border rounded" />
              <div className="h-10 w-full bg-neutral-border/70 rounded-lg" />
            </div>
            <div className="h-10 w-full bg-neutral-border rounded-lg" />
          </div>
        </article>

        <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm min-h-[468px] xl:col-span-2">
          <div className="h-4 w-36 bg-neutral-border rounded mb-4" />

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="h-3 w-20 bg-neutral-border rounded" />
                <div className="h-10 w-full bg-neutral-border/70 rounded-lg" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-16 bg-neutral-border rounded" />
                <div className="h-10 w-full bg-neutral-border/70 rounded-lg" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-3 w-24 bg-neutral-border rounded" />
              <div className="h-24 w-full bg-neutral-border/70 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="h-3 w-16 bg-neutral-border rounded" />
                <div className="h-10 w-full bg-neutral-border/70 rounded-lg" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-14 bg-neutral-border rounded" />
                <div className="h-10 w-full bg-neutral-border/70 rounded-lg" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-16 bg-neutral-border rounded" />
                <div className="h-10 w-full bg-neutral-border/70 rounded-lg" />
              </div>
            </div>

            <div className="h-10 w-[170px] bg-neutral-border rounded-lg" />
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm space-y-3">
        <div className="h-4 w-48 bg-neutral-border rounded" />
        <div className="h-20 bg-neutral-border/70 rounded-xl" />
        <div className="h-20 bg-neutral-border/70 rounded-xl" />
        <div className="h-20 bg-neutral-border/70 rounded-xl" />
      </section>
    </div>
  );
}

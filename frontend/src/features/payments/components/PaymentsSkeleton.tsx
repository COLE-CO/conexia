export default function PaymentsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm min-h-[360px] xl:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded bg-neutral-border" />
            <div className="h-4 w-28 bg-neutral-border rounded" />
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="h-3 w-20 bg-neutral-border rounded" />
              <div className="h-10 w-full bg-neutral-border/70 rounded-lg" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-24 bg-neutral-border rounded" />
              <div className="h-20 w-full bg-neutral-border/70 rounded-lg" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-16 bg-neutral-border rounded" />
              <div className="h-10 w-full bg-neutral-border/70 rounded-lg" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-24 bg-neutral-border rounded" />
              <div className="h-10 w-full bg-neutral-border/70 rounded-lg" />
            </div>
            <div className="h-10 w-full bg-neutral-border rounded-lg" />
          </div>
        </article>

        <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm min-h-[360px] xl:col-span-2">
          <div className="h-4 w-36 bg-neutral-border rounded mb-4" />
          <div className="space-y-3">
            <div className="h-12 bg-neutral-border/70 rounded-xl" />
            <div className="h-12 bg-neutral-border/70 rounded-xl" />
            <div className="h-12 bg-neutral-border/70 rounded-xl" />
            <div className="h-12 bg-neutral-border/70 rounded-xl" />
          </div>
        </article>
      </section>
    </div>
  );
}

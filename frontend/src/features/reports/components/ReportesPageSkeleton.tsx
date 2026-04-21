export default function ReportesPageSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-border flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-neutral-border rounded" />
              <div className="h-3 w-48 bg-neutral-border rounded" />
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="bg-neutral-border/40 border border-neutral-border rounded-xl p-2.5 space-y-1.5"
              >
                <div className="h-2.5 w-14 bg-neutral-border rounded" />
                <div className="h-3.5 w-20 bg-neutral-border rounded" />
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="border-t border-neutral-border pt-3 mb-4 space-y-1.5">
            <div className="h-3 w-full bg-neutral-border rounded" />
            <div className="h-3 w-4/5 bg-neutral-border rounded" />
          </div>

          {/* Botones */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-32 bg-neutral-border rounded-lg" />
            <div className="h-7 w-7 bg-neutral-border rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

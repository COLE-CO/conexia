export default function ChartSkeleton() {
  return (
    <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-44 bg-neutral-border rounded" />
        <div className="h-3 w-16 bg-neutral-border rounded" />
      </div>
      <div className="h-52 bg-neutral-border rounded-xl" />
    </div>
  );
}

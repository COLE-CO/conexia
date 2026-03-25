export default function CardSkeleton() {
  return (
    <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-28 bg-neutral-border rounded" />
        <div className="w-9 h-9 rounded-xl bg-neutral-border" />
      </div>
      <div className="h-10 w-20 bg-neutral-border rounded-lg mb-3" />
      <div className="h-2.5 w-full bg-neutral-border rounded mb-1.5" />
      <div className="h-2.5 w-3/4 bg-neutral-border rounded" />
    </div>
  );
}

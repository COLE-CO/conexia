import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  borderColorClass?: string;
  critical?: boolean;
}

export default function StatCard({
  label,
  value,
  description,
  icon,
  iconBg,
  iconColor,
  borderColorClass = 'border-neutral-border',
  critical = false,
}: StatCardProps) {
  return (
    <article
      className={`relative rounded-2xl p-5 shadow-sm border-2 transition-all duration-300 overflow-hidden ${
        critical && value > 0
          ? 'bg-neutral-surface border-2 border-red-400 hover:shadow-md'
          : `bg-neutral-surface ${borderColorClass} hover:shadow-md`
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold text-neutral-muted uppercase tracking-widest leading-relaxed pr-2">
          {label}
        </span>
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
        >
          {icon}
        </span>
      </div>
      <p className="text-4xl font-bold tracking-tight mb-1 text-neutral-text">
        {value}
      </p>
      <p className="text-xs leading-relaxed text-neutral-muted">
        {description}
      </p>
    </article>
  );
}

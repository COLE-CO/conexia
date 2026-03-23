import { CheckCircle2 } from 'lucide-react';

import type { DashboardMetrics, DateRangeOption } from '../types';

interface PriorityListProps {
  loading: boolean;
  error: string | null;
  dashboard: DashboardMetrics;
  dateRange: DateRangeOption;
  onViewAll: () => void;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const diffInDays = (from: Date, to: Date) => {
  const fromStart = startOfDay(from).getTime();
  const toStart = startOfDay(to).getTime();
  return Math.round((toStart - fromStart) / (1000 * 60 * 60 * 24));
};

const formatDueLabel = (dueDateText: string) => {
  const today = new Date();
  const due = new Date(dueDateText);
  const days = diffInDays(today, due);

  if (days < 0)
    return `Venció hace ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0 || isSameDay(today, due)) return 'Vence hoy';
  if (days === 1) return 'Vence mañana';
  return `Vence en ${days} días`;
};

export default function PriorityList({
  loading,
  error,
  dashboard,
  dateRange,
  onViewAll,
}: PriorityListProps) {
  return (
    <section className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-neutral-text">Prioridades inmediatas</h2>
          {!loading && dashboard.urgentItems.length > 0 && (
            <p className="text-xs text-neutral-muted mt-0.5">
              Vencimientos dentro de los próximos {dateRange} días
            </p>
          )}
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors"
        >
          Ver todas
        </button>
      </div>

      {error ? (
        <div className="px-6 py-10 text-sm text-red-500 text-center">{error}</div>
      ) : loading ? (
        <ul className="divide-y divide-neutral-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="px-6 py-4 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-3 w-52 bg-neutral-border rounded" />
                <div className="h-2.5 w-36 bg-neutral-border rounded" />
              </div>
              <div className="h-6 w-28 bg-neutral-border rounded-full" />
            </li>
          ))}
        </ul>
      ) : dashboard.urgentItems.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <CheckCircle2 size={32} className="text-green-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-text">Todo al día</p>
          <p className="text-xs text-neutral-muted mt-1">
            No hay obligaciones urgentes en los próximos {dateRange} días.
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-neutral-border">
            {dashboard.urgentItems.map((item) => {
              const isOverdue = new Date(item.due_date) < new Date();
              return (
                <li
                  key={item.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-neutral-bg transition-colors duration-150"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        isOverdue ? 'bg-red-400' : 'bg-yellow-400'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-text leading-snug">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-muted mt-0.5">
                        {item.companyName} · {item.due_date.slice(0, 10)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full w-fit shrink-0 ${
                      isOverdue
                        ? 'bg-red-100 text-red-600'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {formatDueLabel(item.due_date)}
                  </span>
                </li>
              );
            })}
          </ul>
          {dashboard.hiddenCount > 0 && (
            <div className="px-6 py-3.5 border-t border-neutral-border bg-neutral-bg/50 flex items-center justify-between">
              <p className="text-xs text-neutral-muted">
                Mostrando 6 de {dashboard.urgentItems.length + dashboard.hiddenCount}{' '}
                prioridades
              </p>
              <button
                onClick={onViewAll}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Ver {dashboard.hiddenCount} más
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

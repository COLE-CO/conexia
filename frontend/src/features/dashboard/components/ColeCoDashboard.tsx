import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';

interface ColeCoDashboardProps {
  currentDateText: string;
  fullName?: string;
  role?: string;
}

export default function ColeCoDashboard({
  currentDateText,
  fullName,
  role,
}: ColeCoDashboardProps) {
  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary font-hubot tracking-tight">
          Dashboard COLE-CO
        </h1>
        <p className="text-sm text-neutral-muted mt-0.5">
          Resumen operativo · {currentDateText}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {[
          {
            label: 'Facturas por aprobar',
            icon: <ClipboardList size={16} />,
            bg: 'bg-primary/10',
            color: 'text-primary',
          },
          {
            label: 'Conciliaciones pendientes',
            icon: <CalendarClock size={16} />,
            bg: 'bg-secondary/15',
            color: 'text-secondary',
          },
          {
            label: 'Alertas contables',
            icon: <AlertTriangle size={16} />,
            bg: 'bg-red-100',
            color: 'text-red-500',
          },
          {
            label: 'Reportes por generar',
            icon: <TrendingUp size={16} />,
            bg: 'bg-green-100',
            color: 'text-green-600',
          },
        ].map(({ label, icon, bg, color }) => (
          <article
            key={label}
            className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-semibold text-neutral-muted uppercase tracking-widest">
                {label}
              </span>
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color}`}
              >
                {icon}
              </span>
            </div>
            <p className="text-4xl font-bold text-neutral-text tracking-tight">
              --
            </p>
          </article>
        ))}
      </div>
      <p className="text-xs text-neutral-muted mt-4">
        Usuario activo: {fullName} · Rol:{' '}
        <span className="uppercase font-semibold">{role}</span>
      </p>
    </section>
  );
}

import { useContext } from 'react';
import {
  BellOff,
  CalendarClock,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const notificationBlocks = [
  {
    key: 'alert_deadlines_enabled',
    title: 'Vencimientos por revisar',
    description:
      'Visualiza recordatorios de obligaciones pendientes y fechas próximas a vencer.',
    icon: CalendarClock,
    accent: 'bg-secondary/15 text-secondary',
  },
  {
    key: 'alert_balances_enabled',
    title: 'Balances pendientes',
    description:
      'Consulta avisos relacionados con cargas y revisiones de balances operativos.',
    icon: FileSpreadsheet,
    accent: 'bg-primary/10 text-primary',
  },
  {
    key: 'alert_reports_enabled',
    title: 'Reportes disponibles',
    description:
      'Recibe notificaciones cuando existan resúmenes o reportes listos para consulta.',
    icon: Sparkles,
    accent: 'bg-amber-100 text-amber-700',
  },
] as const;

export default function NotificationsPage() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const visibleBlocks = notificationBlocks.filter(({ key }) => user[key]);

  return (
    <div className="min-h-screen bg-neutral-bg p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-text font-hubot tracking-tight">
            Notificaciones
          </h1>
          <p className="mt-1 text-sm text-neutral-muted">
            Centro de alertas visible según las preferencias activas en tu
            perfil.
          </p>
        </div>

        {visibleBlocks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-border bg-neutral-surface p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-bg text-neutral-muted">
              <BellOff size={22} />
            </div>
            <h2 className="text-lg font-bold text-neutral-text">
              No hay alertas activas
            </h2>
            <p className="mt-2 text-sm text-neutral-muted">
              Activa uno o más tipos de alertas desde Ajustes para volver a ver
              este módulo.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleBlocks.map(
              ({ key, title, description, icon: Icon, accent }) => (
                <article
                  key={key}
                  className="rounded-3xl border border-neutral-border bg-neutral-surface p-6 shadow-sm"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}
                  >
                    <Icon size={20} />
                  </div>
                  <h2 className="text-base font-bold text-neutral-text">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-muted">
                    {description}
                  </p>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

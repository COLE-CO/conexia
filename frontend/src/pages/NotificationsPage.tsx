import { useContext, useEffect, useMemo, useState } from 'react';
import { BellOff, CalendarClock, CheckCircle2, BellRing } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useNotifications } from '../hooks/useNotifications';
import { getCompanies } from '../services/companyService';
import type { Company } from '../services/companyService';
import NotificationsPageSkeleton from '../features/notifications/components/NotificationsPageSkeleton';

const formatNotificationDate = (isoDate: string) => {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
};

const getNotificationVisual = () => {
  return {
    icon: CalendarClock,
    label: 'Vencimiento',
    tone: 'text-secondary',
  };
};

export default function NotificationsPage() {
  const { user } = useContext(AuthContext);
  const { activeCompany } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] =
    useState<string>('all');
  const [activeTab, setActiveTab] = useState<'pending' | 'read'>('pending');
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [companiesReloadKey, setCompaniesReloadKey] = useState(0);

  const hasEnabledAlerts = !!user?.alert_deadlines_enabled;

  useEffect(() => {
    if (!hasEnabledAlerts) {
      setCompanies([]);
      setCompaniesLoading(false);
      setCompaniesError(null);
      return;
    }

    let ignore = false;

    const fetchCompanies = async () => {
      setCompaniesLoading(true);
      setCompaniesError(null);
      try {
        const data = await getCompanies();
        if (!ignore) {
          setCompanies(data);
        }
      } catch {
        if (!ignore) {
          setCompanies([]);
          setCompaniesError('No se pudieron cargar las empresas.');
        }
      } finally {
        if (!ignore) {
          setCompaniesLoading(false);
        }
      }
    };

    void fetchCompanies();

    return () => {
      ignore = true;
    };
  }, [companiesReloadKey, hasEnabledAlerts]);

  useEffect(() => {
    if (activeCompany?.id && selectedCompanyFilter === 'all') {
      setSelectedCompanyFilter(String(activeCompany.id));
    }
  }, [activeCompany?.id, selectedCompanyFilter]);

  const companyNameById = useMemo(() => {
    return companies.reduce<Record<number, string>>((acc, company) => {
      acc[company.id] = company.name;
      return acc;
    }, {});
  }, [companies]);

  const companyIds = useMemo(() => {
    if (selectedCompanyFilter !== 'all') {
      return [Number(selectedCompanyFilter)].filter((id) =>
        Number.isFinite(id)
      );
    }

    if (companies.length > 0) {
      return companies.map((company) => company.id);
    }

    if (activeCompany?.id) {
      return [activeCompany.id];
    }

    return [];
  }, [activeCompany?.id, companies, selectedCompanyFilter]);

  const {
    notifications,
    unreadCount,
    markAsRead,
    loading,
    error: notificationsError,
    retry: retryNotifications,
  } = useNotifications({
    user,
    companyIds,
    companyNameById,
  });

  const readCount = notifications.length - unreadCount;
  const pendingNotifications = notifications.filter(
    (notification) => !notification.isRead
  );
  const readNotifications = notifications.filter(
    (notification) => notification.isRead
  );
  const visibleNotifications =
    activeTab === 'pending' ? pendingNotifications : readNotifications;
  const activeLoadError = companiesError ?? notificationsError;

  const isInitiallyLoading =
    companiesLoading || (loading && companies.length === 0);

  const handleRetry = () => {
    if (companiesError) {
      setCompaniesReloadKey((current) => current + 1);
    }

    if (notificationsError) {
      retryNotifications();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-bg p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-neutral-text font-hubot tracking-tight">
              Notificaciones
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-red-700 bg-red-600 px-3 py-1 text-xs font-bold text-white">
              <BellRing size={14} />
              Pendientes: {unreadCount}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-muted">
            Revisa alertas recientes y marca como leídas las que ya atendiste.
          </p>
        </div>

        {!hasEnabledAlerts ? (
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
        ) : isInitiallyLoading ? (
          <NotificationsPageSkeleton />
        ) : (
          <div className="space-y-4">
            <section className="rounded-3xl border border-neutral-border bg-neutral-surface p-6 shadow-sm">
              <h3 className="text-base font-bold text-neutral-text">
                Panel de resumen
              </h3>
              <p className="mt-1 text-sm text-neutral-muted">
                Estado actual de tus alertas y acciones recomendadas.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-red-400 p-4">
                  <p className="text-xs uppercase tracking-wide text-red-700">
                    Pendientes
                  </p>
                  <p className="mt-1 text-2xl font-bold text-red-700">
                    {unreadCount}
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-emerald-400 p-4">
                  <p className="text-xs uppercase tracking-wide text-emerald-700">
                    Leídas
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {readCount}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-border bg-neutral-surface p-4 shadow-sm md:p-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-neutral-text">
                    Avisos recientes
                  </h2>
                  <div
                    role="tablist"
                    aria-label="Pestañas de notificaciones"
                    className="inline-flex rounded-xl border border-neutral-border bg-white p-1"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'pending'}
                      onClick={() => setActiveTab('pending')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        activeTab === 'pending'
                          ? 'bg-primary text-white'
                          : 'text-neutral-muted hover:text-neutral-text'
                      }`}
                    >
                      Pendientes ({unreadCount})
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'read'}
                      onClick={() => setActiveTab('read')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        activeTab === 'read'
                          ? 'bg-primary text-white'
                          : 'text-neutral-muted hover:text-neutral-text'
                      }`}
                    >
                      Leídas ({readCount})
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="notifications-company-filter"
                    className="text-xs font-semibold uppercase tracking-wide text-neutral-muted"
                  >
                    Ver todas o filtrar por empresa
                  </label>
                  <select
                    id="notifications-company-filter"
                    value={selectedCompanyFilter}
                    onChange={(event) =>
                      setSelectedCompanyFilter(event.target.value)
                    }
                    className="rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-neutral-text"
                  >
                    <option value="all">Todas</option>
                    {companies.map((company) => (
                      <option key={company.id} value={String(company.id)}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {activeLoadError ? (
                  <div className="md:col-span-2 rounded-2xl border border-danger/30 bg-danger/5 p-6 text-center">
                    <p className="text-sm font-semibold text-danger">
                      {activeLoadError}
                    </p>
                    <p className="mt-1 text-sm text-neutral-muted">
                      Verifica tu conexión e intenta nuevamente.
                    </p>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="mt-4 inline-flex items-center rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                ) : visibleNotifications.length === 0 ? (
                  <div className="md:col-span-2 rounded-2xl border border-neutral-border bg-neutral-bg p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-sm font-semibold text-neutral-text">
                      {activeTab === 'pending'
                        ? 'No hay pendientes por revisar'
                        : 'No hay notificaciones leídas'}
                    </p>
                    <p className="mt-1 text-sm text-neutral-muted">
                      {activeTab === 'pending'
                        ? 'No se encontraron notificaciones pendientes para el filtro seleccionado.'
                        : 'Marca notificaciones como leídas para verlas en esta pestaña.'}
                    </p>
                  </div>
                ) : (
                  visibleNotifications.map((notification) => {
                    const visual = getNotificationVisual();
                    const Icon = visual.icon;
                    const titleWithoutPrefix = notification.title.replace(
                      /^Vencimiento:\s*/,
                      ''
                    );

                    return (
                      <article
                        key={notification.id}
                        className={`h-full rounded-2xl border p-4 transition flex flex-col ${
                          notification.isRead
                            ? 'border-neutral-border/80 bg-neutral-bg/70 opacity-70'
                            : 'border-neutral-border bg-white'
                        }`}
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <Icon size={16} className={visual.tone} />
                          <span className="rounded-full border border-neutral-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-muted">
                            {visual.label}
                          </span>
                        </div>

                        <h3 className="mb-2 font-semibold text-neutral-text">
                          {titleWithoutPrefix}
                        </h3>

                        <p className="mb-3 flex-1 text-sm text-neutral-muted">
                          {notification.message}
                        </p>

                        <div className="flex items-end justify-between gap-2">
                          {notification.isRead ? (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-border bg-white/80 px-3 py-1.5 text-xs font-semibold text-neutral-muted">
                              <CheckCircle2 size={14} />
                              Leída
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-neutral-border px-3 py-1.5 text-xs font-semibold text-neutral-text transition hover:border-secondary hover:text-secondary"
                            >
                              <CheckCircle2 size={14} />
                              Marcar como leída
                            </button>
                          )}
                          <span className="text-xs text-neutral-muted whitespace-nowrap">
                            {formatNotificationDate(notification.isoDate)}
                          </span>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

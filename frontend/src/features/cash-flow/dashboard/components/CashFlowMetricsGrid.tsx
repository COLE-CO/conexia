import type { FC } from 'react';
import type { CashFlowDashboardMetrics } from '../types';

interface CashFlowMetricsGridProps {
  metrics: CashFlowDashboardMetrics;
  loading: boolean;
}

const formatCOP = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
};

interface StatCardProps {
  titulo: string;
  valor: string | number;
  descripcion: string;
  variante?: 'default' | 'positivo' | 'negativo' | 'neutro';
  icono: React.ReactNode;
  loading: boolean;
}

const StatCard: FC<StatCardProps> = ({
  titulo,
  valor,
  descripcion,
  variante = 'default',
  icono,
  loading,
}) => {
  const borderClass = {
    default: 'border-neutral-200',
    positivo: 'border-emerald-200',
    negativo: 'border-red-200',
    neutro: 'border-blue-200',
  }[variante];

  const iconBgClass = {
    default: 'bg-neutral-100 text-neutral-600',
    positivo: 'bg-emerald-50 text-emerald-600',
    negativo: 'bg-red-50 text-red-500',
    neutro: 'bg-blue-50 text-blue-600',
  }[variante];

  if (loading) {
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

  return (
    <div
      className={`bg-neutral-surface rounded-2xl border shadow-sm ${borderClass} p-5 flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          {titulo}
        </span>
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgClass}`}
        >
          {icono}
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-neutral-900">
        {valor}
      </p>
      <p className="text-xs text-neutral-400">{descripcion}</p>
    </div>
  );
};

const CashFlowMetricsGrid: FC<CashFlowMetricsGridProps> = ({
  metrics,
  loading,
}) => {
  const balancePositivo = metrics.balanceNeto >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Saldo total — más prominente, ocupa más peso visual */}
      <StatCard
        titulo="Saldo total disponible"
        valor={loading ? '—' : formatCOP(metrics.saldoTotalDisponible)}
        descripcion={`Entre ${metrics.cuentasActivas} cuentas activas`}
        variante="neutro"
        loading={loading}
        icono={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        }
      />

      {/* Ingresos del período */}
      <StatCard
        titulo="Ingresos del período"
        valor={loading ? '—' : formatCOP(metrics.ingresosPeriodo)}
        descripcion="Total de entradas registradas"
        variante="positivo"
        loading={loading}
        icono={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
        }
      />

      {/* Egresos del período */}
      <StatCard
        titulo="Egresos del período"
        valor={loading ? '—' : formatCOP(metrics.egresosPeriodo)}
        descripcion="Total de salidas registradas"
        variante="negativo"
        loading={loading}
        icono={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M17 13l-5 5m0 0l-5-5m5 5V6"
            />
          </svg>
        }
      />

      {/* Balance neto */}
      <StatCard
        titulo="Balance neto"
        valor={
          loading
            ? '—'
            : `${balancePositivo ? '+' : ''}${formatCOP(metrics.balanceNeto)}`
        }
        descripcion="Ingresos menos egresos del período"
        variante={balancePositivo ? 'positivo' : 'negativo'}
        loading={loading}
        icono={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        }
      />
    </div>
  );
};

export default CashFlowMetricsGrid;

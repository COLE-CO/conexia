import type { FC } from 'react';
import type { CuentaResumen } from '../types';

interface CashFlowAccountsGridProps {
  cuentas: CuentaResumen[];
  loading: boolean;
  onVerCuenta?: (cuentaId: string) => void;
}

const formatCOP = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

const COLORES_BORDE = [
  'border-l-blue-400',
  'border-l-emerald-400',
  'border-l-amber-400',
  'border-l-violet-400',
  'border-l-cyan-400',
  'border-l-rose-400',
];

const CuentaCardSkeleton: FC = () => (
  <div className="animate-pulse bg-neutral-surface rounded-xl border border-neutral-border p-4 space-y-3">
    <div className="h-3 w-1/2 bg-neutral-border rounded" />
    <div className="h-6 w-3/4 bg-neutral-border rounded" />
    <div className="flex gap-4">
      <div className="h-2.5 bg-neutral-border rounded w-1/3" />
      <div className="h-2.5 bg-neutral-border rounded w-1/3" />
    </div>
  </div>
);

const CashFlowAccountsGrid: FC<CashFlowAccountsGridProps> = ({
  cuentas,
  loading,
  onVerCuenta,
}) => {
  return (
    <div className="bg-neutral-surface rounded-2xl border border-neutral-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">
            Saldos por cuenta
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Estado actual de cada cuenta activa
          </p>
        </div>
        {!loading && (
          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">
            {cuentas.length} activas
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <CuentaCardSkeleton key={i} />
            ))
          : cuentas.map((cuenta, index) => {
              const bordeColor = COLORES_BORDE[index % COLORES_BORDE.length];
              const tieneCierrePendiente = cuenta.cierresPendientes > 0;

              return (
                <button
                  key={cuenta.id}
                  onClick={() => onVerCuenta?.(cuenta.id)}
                  className={`text-left bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-xl border border-l-4 border-neutral-200 ${bordeColor} p-4 group`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-neutral-700 truncate">
                        {cuenta.nombre}
                      </p>
                      {cuenta.descripcion && (
                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                          {cuenta.descripcion}
                        </p>
                      )}
                    </div>
                    {tieneCierrePendiente && (
                      <span className="shrink-0 text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                        Cierre pendiente
                      </span>
                    )}
                  </div>

                  <p className="text-lg font-bold text-neutral-900 mt-3">
                    {formatCOP(cuenta.saldo)}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-emerald-600 font-medium">
                      ↑ {formatCOP(cuenta.ingresos)}
                    </span>
                    <span className="text-xs text-red-500 font-medium">
                      ↓ {formatCOP(cuenta.egresos)}
                    </span>
                  </div>
                </button>
              );
            })}
      </div>
    </div>
  );
};

export default CashFlowAccountsGrid;

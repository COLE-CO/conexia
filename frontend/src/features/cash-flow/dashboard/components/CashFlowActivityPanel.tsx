import type { FC } from 'react';
import type { CierreResumen, MovimientoResumen } from '../types';

interface CashFlowActivityPanelProps {
  movimientosRecientes: MovimientoResumen[];
  ultimosCierres: CierreResumen[];
  loading: boolean;
  onVerTodos: () => void;
  onIrACierres: () => void;
}

const formatCOP = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

const formatFecha = (fechaStr: string): string => {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  });
};

const RowSkeleton: FC = () => (
  <div className="animate-pulse flex items-center gap-3 py-3">
    <div className="w-8 h-8 rounded-full bg-neutral-border shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3.5 bg-neutral-border rounded w-2/3" />
      <div className="h-3 bg-neutral-border rounded w-1/3" />
    </div>
    <div className="h-4 bg-neutral-border rounded w-20" />
  </div>
);

const CashFlowActivityPanel: FC<CashFlowActivityPanelProps> = ({
  movimientosRecientes,
  ultimosCierres,
  loading,
  onVerTodos,
  onIrACierres,
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
      {/* Movimientos recientes */}
      <div className="bg-neutral-surface rounded-2xl border border-neutral-border p-5 shadow-sm">
        {loading ? (
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-4 w-44 bg-neutral-border rounded" />
              <div className="h-3 w-16 bg-neutral-border rounded" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">
                  Movimientos recientes
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Últimas transacciones registradas
                </p>
              </div>
              <button
                onClick={onVerTodos}
                className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                Ver todos
              </button>
            </div>
            <div className="divide-y divide-neutral-100">
              {movimientosRecientes.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-8">
                  No hay movimientos registrados.
                </p>
              ) : (
                movimientosRecientes.map((mov) => {
                  const esIngreso = mov.tipo === 'ingreso';
                  return (
                    <div key={mov.id} className="flex items-center gap-3 py-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          esIngreso
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {esIngreso ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 11l5-5m0 0l5 5m-5-5v12"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 13l-5 5m0 0l-5-5m5 5V6"
                            />
                          </svg>
                        )}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-800 truncate">
                          {mov.concepto}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">
                          {mov.cuenta} · {formatFecha(mov.fecha)}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-bold shrink-0 ${
                          esIngreso ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {esIngreso ? '+' : '-'}
                        {formatCOP(mov.monto)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Estado de cierres mensuales */}
      <div className="bg-neutral-surface rounded-2xl border border-neutral-border p-5 shadow-sm">
        {loading ? (
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-4 w-44 bg-neutral-border rounded" />
              <div className="h-3 w-16 bg-neutral-border rounded" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">
                  Estado de cierres
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Último cierre mensual por cuenta
                </p>
              </div>
              <button
                onClick={onIrACierres}
                className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                Ir a cierres
              </button>
            </div>
            <div className="divide-y divide-neutral-100">
              {ultimosCierres.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-8">
                  Sin cierres registrados.
                </p>
              ) : (
                ultimosCierres.map((cierre) => {
                  const esCerrado = cierre.estado === 'cerrado';
                  const balancePositivo = cierre.ingresos - cierre.egresos >= 0;

                  return (
                    <div
                      key={cierre.id}
                      className="flex items-center gap-3 py-3"
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          esCerrado
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {esCerrado ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-800 truncate">
                          {cierre.cuenta}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {cierre.periodo}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-xs font-bold ${balancePositivo ? 'text-emerald-600' : 'text-red-500'}`}
                        >
                          {formatCOP(cierre.saldoCierre)}
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            esCerrado
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {esCerrado ? 'Cerrado' : 'Abierto'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CashFlowActivityPanel;

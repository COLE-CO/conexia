import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

import type {
  CashAccount,
  CashMovement,
} from '../../../services/cashFlowService';
import { currency } from '../types';
import type { CashFlowFiltersState } from '../types';

interface MovementsTimelineProps {
  movements: CashMovement[];
  accounts: CashAccount[];
  filters: CashFlowFiltersState;
  onFiltersChange: (next: CashFlowFiltersState) => void;
  totalMovements: number;
  loading: boolean;
}

export default function MovementsTimeline({
  movements,
  accounts,
  filters,
  onFiltersChange,
  totalMovements,
  loading,
}: MovementsTimelineProps) {
  return (
    <section className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-sm font-semibold text-neutral-text">
          Movimientos cronológicos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <input
            value={filters.search}
            onChange={(event) =>
              onFiltersChange({ ...filters, search: event.target.value })
            }
            placeholder="Buscar concepto o descripción"
            className="rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />

          <select
            value={filters.type}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                type: event.target.value as CashFlowFiltersState['type'],
              })
            }
            className="rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Todos los tipos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>

          <select
            value={filters.accountId}
            onChange={(event) =>
              onFiltersChange({ ...filters, accountId: event.target.value })
            }
            className="rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Todas las cuentas</option>
            {accounts.map((account) => (
              <option key={account.id} value={String(account.id)}>
                {account.name}
              </option>
            ))}
          </select>

          <select
            value={String(filters.periodDays)}
            onChange={(event) => {
              const value = event.target.value;
              onFiltersChange({
                ...filters,
                periodDays:
                  value === 'all' ? 'all' : (Number(value) as 7 | 30 | 90),
              });
            }}
            className="rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="7">Ultimos 7 dias</option>
            <option value="30">Ultimos 30 dias</option>
            <option value="90">Ultimos 90 dias</option>
            <option value="all">Todo el historial</option>
          </select>
        </div>
      </div>

      <div className="min-h-[280px]">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-neutral-border/70 rounded-xl" />
            <div className="h-20 bg-neutral-border/70 rounded-xl" />
            <div className="h-20 bg-neutral-border/70 rounded-xl" />
          </div>
        ) : movements.length === 0 ? (
          <div className="text-sm text-neutral-muted">
            {totalMovements === 0
              ? 'No hay movimientos registrados todavía.'
              : 'No hay movimientos que coincidan con los filtros actuales.'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-border bg-white">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-neutral-border bg-neutral-bg/70 text-neutral-muted">
                  <th className="text-left font-medium px-4 py-3">Concepto</th>
                  <th className="text-left font-medium px-4 py-3">Cuenta</th>
                  <th className="text-left font-medium px-4 py-3">Fecha</th>
                  <th className="text-left font-medium px-4 py-3">Tipo</th>
                  <th className="text-right font-medium px-4 py-3">Monto</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => {
                  const isIncome = movement.movement_type === 'ingreso';

                  return (
                    <tr
                      key={movement.id}
                      className="border-b border-neutral-border last:border-b-0 hover:bg-neutral-bg/50 transition-colors"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-2">
                          {isIncome ? (
                            <ArrowUpCircle
                              size={15}
                              className="text-emerald-600 mt-0.5"
                            />
                          ) : (
                            <ArrowDownCircle
                              size={15}
                              className="text-danger mt-0.5"
                            />
                          )}
                          <div>
                            <p className="font-medium text-neutral-text leading-5">
                              {movement.concept}
                            </p>
                            <p className="text-xs text-neutral-muted mt-0.5 leading-4">
                              {movement.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-neutral-text align-top">
                        {movement.account_name}
                      </td>

                      <td className="px-4 py-3 text-neutral-text align-top">
                        {new Date(movement.movement_date).toLocaleDateString(
                          'es-CO'
                        )}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-danger/10 text-danger'
                          }`}
                        >
                          {isIncome ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right align-top">
                        <p
                          className={`font-semibold ${
                            isIncome ? 'text-emerald-700' : 'text-danger'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {currency.format(Number(movement.amount))}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

import { useState } from 'react';
import { CalendarCheck, Lock, Unlock, AlertTriangle } from 'lucide-react';

import type {
  CashAccount,
  MonthlyClosing,
  MonthlySummary,
} from '../../../services/cashFlowService';
import { currency } from '../types';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

interface MonthlyClosingPanelProps {
  accounts: CashAccount[];
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  year: number;
  setYear: (y: number) => void;
  month: number;
  setMonth: (m: number) => void;
  summary: MonthlySummary | null;
  closings: MonthlyClosing[];
  loading: boolean;
  closing: boolean;
  error: string | null;
  onCloseMonth: () => Promise<void>;
}

export default function MonthlyClosingPanel({
  accounts,
  selectedAccountId,
  setSelectedAccountId,
  year,
  setYear,
  month,
  setMonth,
  summary,
  closings,
  loading,
  closing,
  error,
  onCloseMonth,
}: MonthlyClosingPanelProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmClose = async () => {
    await onCloseMonth();
    setShowConfirm(false);
  };

  return (
    <div className="space-y-4">
      {/* Selectores */}
      <section className="rounded-2xl border border-neutral-border bg-neutral-surface p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-neutral-text">
          <CalendarCheck size={18} />
          <h2 className="text-sm font-semibold">Cierre Mensual</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="closing-account"
              className="block text-xs font-semibold text-neutral-muted mb-1"
            >
              Cuenta
            </label>
            <select
              id="closing-account"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-neutral-text"
            >
              {accounts.map((account) => (
                <option key={account.id} value={String(account.id)}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="closing-year"
              className="block text-xs font-semibold text-neutral-muted mb-1"
            >
              Año
            </label>
            <input
              id="closing-year"
              type="number"
              min={2020}
              max={2100}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-neutral-text"
            />
          </div>

          <div>
            <label
              htmlFor="closing-month"
              className="block text-xs font-semibold text-neutral-muted mb-1"
            >
              Mes
            </label>
            <select
              id="closing-month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-neutral-text"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-center">
          <p className="text-sm font-semibold text-danger">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 text-center animate-pulse">
          <p className="text-sm text-neutral-muted">Cargando resumen...</p>
        </div>
      )}

      {/* Resumen mensual */}
      {!loading && summary && (
        <section className="rounded-2xl border border-neutral-border bg-neutral-surface p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-text">
              Resumen: {MONTH_NAMES[summary.month - 1]} {summary.year} -{' '}
              {summary.account_name}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                summary.is_closed
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {summary.is_closed ? (
                <>
                  <Lock size={12} /> Cerrado
                </>
              ) : (
                <>
                  <Unlock size={12} /> Abierto
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-neutral-border p-3 bg-white">
              <p className="text-xs text-neutral-muted">Saldo inicial</p>
              <p className="text-lg font-bold text-neutral-text">
                {currency.format(Number(summary.opening_balance))}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-border p-3 bg-white">
              <p className="text-xs text-neutral-muted">Ingresos</p>
              <p className="text-lg font-bold text-emerald-600">
                +{currency.format(Number(summary.total_income))}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-border p-3 bg-white">
              <p className="text-xs text-neutral-muted">Egresos</p>
              <p className="text-lg font-bold text-red-600">
                -{currency.format(Number(summary.total_expenses))}
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 p-3 bg-primary/5">
              <p className="text-xs text-neutral-muted">Saldo de cierre</p>
              <p className="text-lg font-bold text-primary">
                {currency.format(Number(summary.closing_balance))}
              </p>
            </div>
          </div>

          {/* Boton cerrar mes */}
          {!summary.is_closed && (
            <div className="mt-4">
              {!showConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                >
                  <Lock size={14} />
                  Cerrar Mes
                </button>
              ) : (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle
                      size={16}
                      className="text-amber-600 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Esta accion es irreversible
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Se bloqueara {MONTH_NAMES[summary.month - 1]}{' '}
                        {summary.year} para la cuenta {summary.account_name}. No
                        se podran registrar movimientos en este periodo.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmClose}
                      disabled={closing}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
                    >
                      {closing ? 'Cerrando...' : 'Confirmar cierre'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      className="rounded-lg border border-neutral-border px-3 py-1.5 text-xs font-semibold text-neutral-text transition hover:bg-neutral-bg"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {summary.is_closed && summary.closed_at && (
            <p className="mt-3 text-xs text-neutral-muted">
              Cerrado el{' '}
              {new Intl.DateTimeFormat('es-CO', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(summary.closed_at))}
            </p>
          )}
        </section>
      )}

      {/* Historial de cierres */}
      {closings.length > 0 && (
        <section className="rounded-2xl border border-neutral-border bg-neutral-surface p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-text mb-3">
            Historial de cierres
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-border text-left text-xs text-neutral-muted">
                  <th className="pb-2 pr-3">Periodo</th>
                  <th className="pb-2 pr-3">Saldo inicial</th>
                  <th className="pb-2 pr-3">Ingresos</th>
                  <th className="pb-2 pr-3">Egresos</th>
                  <th className="pb-2 pr-3">Saldo cierre</th>
                  <th className="pb-2">Fecha cierre</th>
                </tr>
              </thead>
              <tbody>
                {closings.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-neutral-border/50 last:border-0"
                  >
                    <td className="py-2 pr-3 font-medium text-neutral-text">
                      {MONTH_NAMES[c.month - 1]} {c.year}
                    </td>
                    <td className="py-2 pr-3">
                      {currency.format(Number(c.opening_balance))}
                    </td>
                    <td className="py-2 pr-3 text-emerald-600">
                      +{currency.format(Number(c.total_income))}
                    </td>
                    <td className="py-2 pr-3 text-red-600">
                      -{currency.format(Number(c.total_expenses))}
                    </td>
                    <td className="py-2 pr-3 font-bold text-primary">
                      {currency.format(Number(c.closing_balance))}
                    </td>
                    <td className="py-2 text-neutral-muted">
                      {c.closed_at
                        ? new Intl.DateTimeFormat('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }).format(new Date(c.closed_at))
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

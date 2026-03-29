import { Landmark, Wallet } from 'lucide-react';

import type { CashAccount } from '../../../services/cashFlowService';
import { currency } from '../types';

interface CashFlowSummaryProps {
  accounts: CashAccount[];
  totalBalance: number;
}

export default function CashFlowSummary({
  accounts,
  totalBalance,
}: CashFlowSummaryProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-xs text-neutral-muted">Saldo total disponible</p>
            <p className="text-xl font-bold text-neutral-text">
              {currency.format(totalBalance)}
            </p>
          </div>
        </div>
        <p className="text-xs text-neutral-muted">
          Total acumulado entre todas las cuentas activas de caja.
        </p>
      </article>

      <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-5 shadow-sm lg:col-span-2">
        <div className="flex items-center gap-2 mb-4 text-neutral-text">
          <Landmark size={18} />
          <h2 className="text-sm font-semibold">Saldos por cuenta</h2>
        </div>

        {accounts.length === 0 ? (
          <p className="text-sm text-neutral-muted">
            Aún no hay cuentas registradas. Crea la primera cuenta para empezar.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-xl border border-neutral-border p-3 bg-white"
              >
                <p className="text-sm font-semibold text-neutral-text">
                  {account.name}
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  {currency.format(Number(account.current_balance))}
                </p>
                {account.description && (
                  <p className="text-xs text-neutral-muted mt-1">
                    {account.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

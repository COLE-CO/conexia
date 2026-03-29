import { PlusCircle } from 'lucide-react';
import type { FormEvent } from 'react';

import type { AccountFormState } from '../types';

interface NewAccountCardProps {
  accountForm: AccountFormState;
  onChange: (next: AccountFormState) => void;
  accountError: string | null;
  accountSaving: boolean;
  canSaveAccount: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function NewAccountCard({
  accountForm,
  onChange,
  accountError,
  accountSaving,
  canSaveAccount,
  onSubmit,
}: NewAccountCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm xl:col-span-1">
      <div className="flex items-center gap-2 mb-4 text-neutral-text">
        <PlusCircle size={18} />
        <h2 className="text-sm font-semibold">Nueva cuenta</h2>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="text-xs text-neutral-muted">Nombre de cuenta *</label>
          <input
            value={accountForm.name}
            onChange={(event) =>
              onChange({ ...accountForm, name: event.target.value })
            }
            className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ej: Bancolombia principal"
          />
        </div>

        <div>
          <label className="text-xs text-neutral-muted">Descripción</label>
          <textarea
            value={accountForm.description}
            onChange={(event) =>
              onChange({ ...accountForm, description: event.target.value })
            }
            className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            rows={2}
            placeholder="Opcional"
          />
        </div>

        <div>
          <label className="text-xs text-neutral-muted">Saldo inicial *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={accountForm.initial_balance}
            onChange={(event) =>
              onChange({ ...accountForm, initial_balance: event.target.value })
            }
            className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="0"
          />
        </div>

        {accountError && (
          <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md px-2 py-1">
            {accountError}
          </p>
        )}

        <button
          disabled={!canSaveAccount || accountSaving}
          className="w-full rounded-lg bg-primary text-white text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="inline-flex items-center justify-center min-w-[120px]">
            {accountSaving ? 'Guardando...' : 'Crear cuenta'}
          </span>
        </button>
      </form>
    </article>
  );
}

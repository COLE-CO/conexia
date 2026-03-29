import type { FormEvent } from 'react';

import type {
  CashAccount,
  CashMovementType,
} from '../../../services/cashFlowService';
import type { MovementFormState } from '../types';

interface NewMovementCardProps {
  movementForm: MovementFormState;
  onChange: (next: MovementFormState) => void;
  accounts: CashAccount[];
  movementError: string | null;
  movementSaving: boolean;
  canSaveMovement: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function NewMovementCard({
  movementForm,
  onChange,
  accounts,
  movementError,
  movementSaving,
  canSaveMovement,
  onSubmit,
}: NewMovementCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm xl:col-span-2">
      <h2 className="text-sm font-semibold text-neutral-text mb-4">
        Registrar movimiento
      </h2>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-neutral-muted">Concepto *</label>
            <input
              value={movementForm.concept}
              onChange={(event) =>
                onChange({ ...movementForm, concept: event.target.value })
              }
              className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ej: Pago proveedor"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-muted">Monto *</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={movementForm.amount}
              onChange={(event) =>
                onChange({ ...movementForm, amount: event.target.value })
              }
              className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-neutral-muted">Descripción *</label>
          <textarea
            value={movementForm.description}
            onChange={(event) =>
              onChange({ ...movementForm, description: event.target.value })
            }
            className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            rows={3}
            placeholder="Detalle de la transacción"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-neutral-muted">Fecha *</label>
            <input
              type="date"
              value={movementForm.movement_date}
              onChange={(event) =>
                onChange({ ...movementForm, movement_date: event.target.value })
              }
              className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-muted">Tipo *</label>
            <select
              value={movementForm.movement_type}
              onChange={(event) =>
                onChange({
                  ...movementForm,
                  movement_type: event.target.value as CashMovementType,
                })
              }
              className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-neutral-muted">Cuenta *</label>
            <select
              value={movementForm.account_id}
              onChange={(event) =>
                onChange({ ...movementForm, account_id: event.target.value })
              }
              className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Selecciona una cuenta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {movementError && (
          <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md px-2 py-1">
            {movementError}
          </p>
        )}

        <button
          disabled={!canSaveMovement || movementSaving}
          className="rounded-lg bg-primary text-white text-sm px-4 py-2.5 min-w-[170px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="inline-flex items-center justify-center w-full">
            {movementSaving ? 'Guardando...' : 'Guardar movimiento'}
          </span>
        </button>
      </form>
    </article>
  );
}

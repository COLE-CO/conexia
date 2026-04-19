import { CreditCard } from 'lucide-react';
import type { FormEvent } from 'react';

import type { PaymentFormState } from '../types';

interface NewPaymentCardProps {
  paymentForm: PaymentFormState;
  onChange: (next: PaymentFormState) => void;
  error: string | null;
  saving: boolean;
  canSave: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function NewPaymentCard({
  paymentForm,
  onChange,
  error,
  saving,
  canSave,
  onSubmit,
}: NewPaymentCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm xl:col-span-1">
      <div className="flex items-center gap-2 mb-4 text-neutral-text">
        <CreditCard size={18} />
        <h2 className="text-sm font-semibold">Nuevo pago</h2>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="text-xs text-neutral-muted">Concepto *</label>
          <input
            value={paymentForm.concept}
            onChange={(e) =>
              onChange({ ...paymentForm, concept: e.target.value })
            }
            className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ej: Arriendo oficina"
          />
        </div>

        <div>
          <label className="text-xs text-neutral-muted">Descripcion *</label>
          <textarea
            value={paymentForm.description}
            onChange={(e) =>
              onChange({ ...paymentForm, description: e.target.value })
            }
            className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            rows={2}
            placeholder="Detalle del pago"
          />
        </div>

        <div>
          <label className="text-xs text-neutral-muted">Monto *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={paymentForm.amount}
            onChange={(e) =>
              onChange({ ...paymentForm, amount: e.target.value })
            }
            className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="0"
          />
        </div>

        <div>
          <label className="text-xs text-neutral-muted">Fecha limite *</label>
          <input
            type="date"
            value={paymentForm.due_date}
            onChange={(e) =>
              onChange({ ...paymentForm, due_date: e.target.value })
            }
            className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {error && (
          <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md px-2 py-1">
            {error}
          </p>
        )}

        <button
          disabled={!canSave || saving}
          className="w-full rounded-lg bg-primary text-white text-sm py-2.5 disabled:bg-primary disabled:opacity-100 disabled:cursor-not-allowed"
        >
          <span className="inline-flex items-center justify-center min-w-[120px]">
            {saving ? 'Guardando...' : 'Crear pago'}
          </span>
        </button>
      </form>
    </article>
  );
}

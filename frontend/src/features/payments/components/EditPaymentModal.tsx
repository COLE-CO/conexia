import { X } from 'lucide-react';
import type { FormEvent } from 'react';

import type { PaymentFormState } from '../types';

interface EditPaymentModalProps {
  editForm: PaymentFormState;
  onChange: (next: PaymentFormState) => void;
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
}

export default function EditPaymentModal({
  editForm,
  onChange,
  saving,
  onSubmit,
  onCancel,
}: EditPaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-text">
            Editar pago
          </h3>
          <button
            onClick={onCancel}
            className="text-neutral-muted hover:text-neutral-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-xs text-neutral-muted">Concepto *</label>
            <input
              value={editForm.concept}
              onChange={(e) =>
                onChange({ ...editForm, concept: e.target.value })
              }
              className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-muted">Descripcion *</label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                onChange({ ...editForm, description: e.target.value })
              }
              className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs text-neutral-muted">Monto *</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={editForm.amount}
              onChange={(e) =>
                onChange({ ...editForm, amount: e.target.value })
              }
              className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-muted">
              Fecha limite *
            </label>
            <input
              type="date"
              value={editForm.due_date}
              onChange={(e) =>
                onChange({ ...editForm, due_date: e.target.value })
              }
              className="w-full mt-1 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-neutral-border text-sm py-2.5 text-neutral-text hover:bg-neutral-bg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-primary text-white text-sm py-2.5 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

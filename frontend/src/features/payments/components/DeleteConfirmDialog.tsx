import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
            <AlertTriangle size={24} className="text-danger" />
          </div>
        </div>

        <h3 className="text-sm font-semibold text-neutral-text mb-1">
          Eliminar pago
        </h3>
        <p className="text-xs text-neutral-muted mb-5">
          Esta accion no se puede deshacer. El registro del pago se eliminara
          permanentemente.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-neutral-border text-sm py-2.5 text-neutral-text hover:bg-neutral-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-danger text-white text-sm py-2.5 hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

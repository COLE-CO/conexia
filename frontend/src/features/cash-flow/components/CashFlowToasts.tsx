interface ToastItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface CashFlowToastsProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export default function CashFlowToasts({ toasts, onDismiss }: CashFlowToastsProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[300px] max-w-[360px] rounded-lg border px-4 py-3 shadow-lg bg-white ${
            toast.type === 'success'
              ? 'border-emerald-300 text-emerald-800'
              : 'border-danger/40 text-danger'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              Cerrar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

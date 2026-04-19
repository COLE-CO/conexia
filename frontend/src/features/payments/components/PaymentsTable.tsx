import { CheckCircle, Pencil, Trash2 } from 'lucide-react';

import type { Payment } from '../../../services/paymentsService';
import { currency, getTrafficLight } from '../types';

interface PaymentsTableProps {
  payments: Payment[];
  onMarkPaid: (id: number) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (id: number) => void;
}

const trafficStyles = {
  red: {
    badge: 'bg-red-100 text-red-700 border border-red-200',
    row: 'border-l-4 border-l-red-400',
    label: 'Vencido',
  },
  yellow: {
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    row: 'border-l-4 border-l-amber-400',
    label: 'Pendiente',
  },
  gray: {
    badge: 'bg-neutral-100 text-neutral-500 border border-neutral-200',
    row: 'border-l-4 border-l-neutral-300',
    label: 'Pagado',
  },
};

export default function PaymentsTable({
  payments,
  onMarkPaid,
  onEdit,
  onDelete,
}: PaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm xl:col-span-2">
        <h2 className="text-sm font-semibold text-neutral-text mb-4">
          Pagos registrados
        </h2>
        <p className="text-sm text-neutral-muted text-center py-8">
          No hay pagos registrados aun. Crea uno desde el formulario.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-neutral-border bg-neutral-surface p-6 shadow-sm xl:col-span-2">
      <h2 className="text-sm font-semibold text-neutral-text mb-4">
        Pagos registrados
      </h2>

      <div className="overflow-x-auto rounded-xl border border-neutral-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-border bg-neutral-bg/50 text-left text-xs text-neutral-muted">
              <th className="px-4 py-3 font-medium">Concepto</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Fecha limite</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const light = getTrafficLight(payment.status, payment.due_date);
              const styles = trafficStyles[light];

              return (
                <tr
                  key={payment.id}
                  className={`border-b border-neutral-border last:border-b-0 hover:bg-neutral-bg/30 transition-colors ${styles.row}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-text">
                      {payment.concept}
                    </p>
                    <p className="text-xs text-neutral-muted mt-0.5 line-clamp-1">
                      {payment.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-text whitespace-nowrap">
                    {currency.format(Number(payment.amount))}
                  </td>
                  <td className="px-4 py-3 text-neutral-muted whitespace-nowrap">
                    {new Date(payment.due_date + 'T00:00:00').toLocaleDateString(
                      'es-CO'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}
                    >
                      {styles.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {payment.status === 'pendiente' && (
                        <>
                          <button
                            onClick={() => onMarkPaid(payment.id)}
                            title="Marcar como pagado"
                            className="rounded-lg bg-emerald-600 text-white px-2.5 py-1.5 text-xs font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-1"
                          >
                            <CheckCircle size={13} />
                            Pagado
                          </button>
                          <button
                            onClick={() => onEdit(payment)}
                            title="Editar"
                            className="rounded-lg border border-neutral-border px-2 py-1.5 text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDelete(payment.id)}
                        title="Eliminar"
                        className="rounded-lg border border-neutral-border px-2 py-1.5 text-neutral-muted hover:text-danger hover:border-danger/30 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

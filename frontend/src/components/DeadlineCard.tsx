import { useState } from 'react';
import { MoreVertical, Check, Pencil, Trash2 } from 'lucide-react';
import type { Deadline } from '../services/deadlineService';

interface Props {
  deadline: Deadline;
  onConfirm: (id: number) => void;
  onEdit: (deadline: Deadline) => void;
  onDelete: (id: number) => void;
  companyName?: string;
  isLast?: boolean;
}

function getSemaphore(due_date: string, status: string) {
  if (status === 'cumplido') {
    return {
      badge: 'bg-neutral-bg text-neutral-muted border border-neutral-border',
      label: 'Cumplido',
    };
  }
  const today = new Date();
  const due = new Date(due_date);
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0)
    return { badge: 'bg-red-100 text-red-500', label: 'Vencido' };
  if (diffDays <= 10)
    return { badge: 'bg-yellow-100 text-yellow-700', label: 'Próximo' };
  return { badge: 'bg-secondary text-white', label: 'Pendiente' };
}

export default function DeadlineCard({
  deadline,
  onConfirm,
  onEdit,
  onDelete,
  companyName,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const semaphore = getSemaphore(deadline.due_date, deadline.status);

  return (
    <tr className="border-b border-neutral-border hover:bg-neutral-bg/50 transition-colors duration-150">
      <td className="py-4 px-4 text-sm text-neutral-text">{deadline.name}</td>
      <td className="py-4 px-4 text-sm text-neutral-muted">
        {companyName ?? '—'}
      </td>
      <td className="py-4 px-4 text-sm text-neutral-muted">
        {deadline.due_date.slice(0, 10)}
      </td>
      <td className="py-4 px-4">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${semaphore.badge}`}
        >
          {semaphore.label}
        </span>
      </td>
      <td className="py-4 px-4 relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-1 rounded-lg text-neutral-muted hover:bg-neutral-bg transition-colors duration-200"
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <>
            {/* Overlay para cerrar */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className={`absolute right-4 z-50 bg-neutral-surface border border-neutral-border rounded-xl shadow-lg w-40 overflow-hidden
              ${'bottom-8'}
            `}
            >
              {deadline.status === 'pendiente' && (
                <button
                  onClick={() => {
                    onConfirm(deadline.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
                >
                  <Check size={14} className="text-green-500" /> Confirmar
                </button>
              )}
              <button
                onClick={() => {
                  onEdit(deadline);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
              >
                <Pencil size={14} className="text-secondary" /> Editar
              </button>
              <button
                onClick={() => {
                  onDelete(deadline.id);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-50 transition-colors duration-200"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}

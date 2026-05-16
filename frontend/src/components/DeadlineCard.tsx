import { useRef, useState } from 'react';
import {
  MoreVertical,
  Check,
  Pencil,
  Trash2,
  Paperclip,
  Download,
  FileX,
} from 'lucide-react';
import type { Deadline } from '../services/deadlineService';
import { OBLIGATION_LABELS } from '../services/deadlineService';

interface Props {
  deadline: Deadline;
  onConfirm: (id: number) => void;
  onEdit: (deadline: Deadline) => void;
  onDelete: (id: number) => void;
  onUploadProof: (id: number, file: File) => void;
  onDownloadProof: (id: number) => void;
  onRemoveProof: (id: number) => void;
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
  onUploadProof,
  onDownloadProof,
  onRemoveProof,
  companyName,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const semaphore = getSemaphore(deadline.due_date, deadline.status);
  const hasProof = Boolean(deadline.proof_filename);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadProof(deadline.id, file);
    }
    e.target.value = '';
  };

  return (
    <tr className="border-b border-neutral-border hover:bg-neutral-bg/50 transition-colors duration-150">
      <td className="py-4 px-4 text-sm text-neutral-text">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">
              {deadline.obligation_type
                ? (OBLIGATION_LABELS[deadline.obligation_type] ?? deadline.name)
                : deadline.name}
            </span>
            {deadline.source === 'calendar_dian_2026' && (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                DIAN
              </span>
            )}
            {hasProof && (
              <span
                title={`Comprobante: ${deadline.proof_filename}`}
                className="text-secondary"
              >
                <Paperclip size={14} />
              </span>
            )}
          </div>
          {deadline.period_label && (
            <span className="text-xs text-neutral-muted">
              {deadline.period_label}
            </span>
          )}
        </div>
      </td>
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
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-1 rounded-lg text-neutral-muted hover:bg-neutral-bg transition-colors duration-200"
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className={`absolute right-4 z-50 bg-neutral-surface border border-neutral-border rounded-xl shadow-lg w-52 overflow-hidden
              ${'bottom-8'}
            `}
            >
              {deadline.status === 'pendiente' && (
                <button
                  onClick={() => {
                    onConfirm(deadline.id);
                    setMenuOpen(false);
                  }}
                  disabled={!hasProof}
                  title={
                    !hasProof
                      ? 'Adjunta un comprobante para poder confirmar'
                      : undefined
                  }
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <Check size={14} className="text-green-500" /> Confirmar
                </button>
              )}
              {deadline.status === 'pendiente' && (
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
                >
                  <Paperclip size={14} className="text-secondary" />
                  {hasProof ? 'Reemplazar comprobante' : 'Subir comprobante'}
                </button>
              )}
              {hasProof && (
                <button
                  onClick={() => {
                    onDownloadProof(deadline.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
                >
                  <Download size={14} className="text-secondary" /> Descargar
                  comprobante
                </button>
              )}
              {hasProof && deadline.status === 'pendiente' && (
                <button
                  onClick={() => {
                    onRemoveProof(deadline.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
                >
                  <FileX size={14} className="text-red-400" /> Eliminar
                  comprobante
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

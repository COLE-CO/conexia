import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type {
  Deadline,
  CreateDeadline,
  UpdateDeadline,
} from '../services/deadlineService';
import { createDeadline, updateDeadline } from '../services/deadlineService';
import { useCompany } from '../context/CompanyContext';

interface Props {
  onClose: () => void;
  onSuccess: (deadline: Deadline) => void;
  editing?: Deadline | null;
}

export default function DeadlineModal({ onClose, onSuccess, editing }: Props) {
  const { activeCompany } = useCompany();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description ?? '');
      setDueDate(editing.due_date.slice(0, 10));
    }
  }, [editing]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!dueDate) {
      setError('La fecha de vencimiento es obligatoria.');
      return;
    }
    if (!activeCompany && !editing) {
      setError('No hay empresa seleccionada.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result: Deadline;
      if (editing) {
        const data: UpdateDeadline = {
          name,
          description: description || undefined,
          due_date: dueDate,
        };
        result = await updateDeadline(editing.id, data);
      } else {
        const data: CreateDeadline = {
          company_id: activeCompany!.id,
          name,
          description: description || undefined,
          due_date: dueDate,
        };
        result = await createDeadline(data);
      }
      onSuccess(result);
    } catch {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-neutral-surface border border-neutral-border rounded-xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-neutral-text font-hubot">
            {editing ? 'Editar obligación' : 'Nueva obligación'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-muted hover:text-neutral-text bg-transparent border-none cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Empresa */}
        {!editing && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-neutral-bg border border-neutral-border text-sm text-neutral-text">
             {activeCompany?.name}
          </div>
        )}

        {/* Nombre */}
        <div className="mb-4">
          <label className="text-xs text-neutral-muted mb-1 block">
            Nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Declaración de renta"
            className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-neutral-bg text-sm text-neutral-text focus:outline-none focus:border-secondary"
          />
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="text-xs text-neutral-muted mb-1 block">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles adicionales..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-neutral-bg text-sm text-neutral-text focus:outline-none focus:border-secondary resize-none"
          />
        </div>

        {/* Fecha */}
        <div className="mb-4">
          <label className="text-xs text-neutral-muted mb-1 block">
            Fecha de vencimiento *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-neutral-bg text-sm text-neutral-text focus:outline-none focus:border-secondary"
          />
        </div>

        {/* Error */}
        {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Guardando...'
              : editing
                ? 'Guardar cambios'
                : 'Crear obligación'}
          </button>
        </div>
      </div>
    </div>
  );
}

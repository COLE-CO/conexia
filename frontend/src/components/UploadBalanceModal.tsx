import { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { uploadBalance } from '../services/balanceService';
import type { Balance } from '../services/balanceService';
import { X, Upload, FileSpreadsheet } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: (balance: Balance) => void;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.xlsx', '.xls'];
const MAX_SIZE_MB = 15;

export default function UploadBalanceModal({ onClose, onSuccess }: Props) {
  const { activeCompany } = useCompany();
  const [file, setFile] = useState<File | null>(null);
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [month, setMonth] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateFile = (f: File): string | null => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Formato no permitido. Solo se aceptan: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `El archivo supera el límite de ${MAX_SIZE_MB}MB`;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const validationError = validateFile(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!activeCompany) {
      setError('Se debe seleccionar una empresa antes.');
      return;
    }
    if (!file) {
      setError('Selecciona un archivo antes de continuar.');
      return;
    }
    if (!year) {
      setError('El año es obligatorio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newBalance = await uploadBalance(
        activeCompany.id,
        Number(year),
        month ? Number(month) : undefined,
        file
      );
      setSuccess(true);
      setTimeout(() => onSuccess(newBalance), 1000);
    } catch {
      setError('Error al subir el archivo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-neutral-surface border border-neutral-border rounded-xl shadow-xl w-full max-w-md p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-neutral-text font-hubot">Subir balance</h2>
          <button
            onClick={onClose}
            className="text-neutral-muted hover:text-neutral-text bg-transparent border-none cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Empresa */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-neutral-bg border border-neutral-border text-sm text-neutral-text">
          {activeCompany
            ? <span>📁 {activeCompany.name}</span>
            : <span className="text-red-400">No hay empresa seleccionada</span>}
        </div>

        {/* Año y mes */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs text-neutral-muted mb-1 block">Año *</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-neutral-bg text-sm text-neutral-text focus:outline-none focus:border-secondary"
              placeholder="2026"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-neutral-muted mb-1 block">Mes (opcional)</label>
            <select
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-border bg-neutral-bg text-sm text-neutral-text focus:outline-none focus:border-secondary"
            >
              <option value="">Todos</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('es', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload area */}
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-border rounded-xl p-6 cursor-pointer hover:border-secondary transition-colors duration-200 mb-4">
          <FileSpreadsheet size={28} className="text-neutral-muted" />
          <span className="text-sm text-neutral-text font-medium">
            {file ? file.name : 'Haz click para seleccionar un archivo'}
          </span>
          <span className="text-xs text-neutral-muted">PDF, XLSX o XLS · Máx. 15MB</span>
          <input
            type="file"
            accept=".pdf,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 mb-4">{error}</p>
        )}

        {/* Success */}
        {success && (
          <p className="text-xs text-green-500 mb-4">✅ Balance subido exitosamente</p>
        )}

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
            disabled={loading || !file || !activeCompany}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16} />
            {loading ? 'Subiendo...' : 'Subir balance'}
          </button>
        </div>

      </div>
    </div>
  );
}
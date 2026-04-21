import { useState, useEffect, useMemo } from 'react';
import { useCompany } from '../context/CompanyContext';
import CompanySelector from '../components/CompanySelector';
import ReportesPageSkeleton from '../features/reports/components/ReportesPageSkeleton';
import {
  getSavedReportsByCompany,
  getAllSavedReports,
  deleteSavedReport,
  downloadSavedReport,
  type SavedReport,
} from '../services/reportService';
import {
  BarChart2,
  FileText,
  FileDown,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
} from 'lucide-react';

export default function ReportesPage() {
  const { activeCompany } = useCompany();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetch = activeCompany
      ? getSavedReportsByCompany(activeCompany.id)
      : getAllSavedReports();

    fetch
      .then(setReports)
      .catch(() => setError('No se pudieron cargar los reportes.'))
      .finally(() => setLoading(false));
  }, [activeCompany]);

  const handleDelete = async (id: number) => {
    try {
      await deleteSavedReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Error al eliminar el reporte.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleDownload = async (report: SavedReport) => {
    setDownloadingId(report.id);
    try {
      await downloadSavedReport(report.id);
    } catch {
      setError('Error al descargar el PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    `$ ${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const filteredLabel = useMemo(
    () => (activeCompany ? activeCompany.name : 'todas las empresas'),
    [activeCompany]
  );

  return (
    <div className="p-8 min-h-screen bg-neutral-bg relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 w-80 h-80 rounded-full bg-secondary/7 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text font-hubot tracking-tight">
            Reportes
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Historial de reportes generados con IA.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2">
          <Sparkles size={14} className="text-secondary" />
          <span className="text-xs text-secondary font-medium">
            Generados con IA
          </span>
        </div>
      </div>

      {/* Selector de empresa */}
      <div className="relative z-40 flex items-center gap-3 mb-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-muted">Empresa</span>
          <CompanySelector />
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        {loading ? (
          <ReportesPageSkeleton />
        ) : error ? (
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 text-center shadow-sm">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-neutral-bg border border-neutral-border flex items-center justify-center mx-auto mb-4">
              <BarChart2 size={24} className="text-neutral-muted" />
            </div>
            <p className="text-sm font-semibold text-neutral-text mb-1">
              No hay reportes guardados
            </p>
            <p className="text-xs text-neutral-muted">
              Los reportes que generes con IA desde Family Office aparecerán
              aquí automáticamente al exportarlos.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-neutral-muted">
                {reports.length} {reports.length === 1 ? 'reporte' : 'reportes'}{' '}
                · {filteredLabel}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-secondary/10 border border-secondary/20 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-secondary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-text leading-tight truncate">
                        {report.company_name}
                      </p>
                      <p className="text-xs text-neutral-muted mt-0.5">
                        {report.period} · {formatDate(report.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-green-50 border border-green-100 rounded-xl p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp size={11} className="text-green-600" />
                        <span className="text-[10px] text-green-700 font-medium">
                          Ingresos
                        </span>
                      </div>
                      <p className="text-xs font-bold text-green-700 truncate">
                        {formatCurrency(report.total_income)}
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingDown size={11} className="text-red-500" />
                        <span className="text-[10px] text-red-700 font-medium">
                          Gastos
                        </span>
                      </div>
                      <p className="text-xs font-bold text-red-600 truncate">
                        {formatCurrency(report.total_expenses)}
                      </p>
                    </div>
                    <div
                      className={`border rounded-xl p-2.5 ${report.net_result >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <DollarSign
                          size={11}
                          className={
                            report.net_result >= 0
                              ? 'text-blue-600'
                              : 'text-orange-500'
                          }
                        />
                        <span
                          className={`text-[10px] font-medium ${report.net_result >= 0 ? 'text-blue-700' : 'text-orange-700'}`}
                        >
                          Neto
                        </span>
                      </div>
                      <p
                        className={`text-xs font-bold truncate ${report.net_result >= 0 ? 'text-blue-700' : 'text-orange-600'}`}
                      >
                        {formatCurrency(report.net_result)}
                      </p>
                    </div>
                  </div>

                  {report.ai_summary && (
                    <p className="text-xs text-neutral-muted leading-relaxed line-clamp-2 mb-4 border-t border-neutral-border pt-3">
                      {report.ai_summary}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(report)}
                      disabled={downloadingId === report.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
                    >
                      <FileDown size={13} />
                      {downloadingId === report.id
                        ? 'Descargando...'
                        : 'Descargar PDF'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(report.id)}
                      className="p-1.5 rounded-lg border border-neutral-border text-red-400 hover:bg-red-50 transition-colors duration-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal confirmar eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-text">
                  Eliminar reporte
                </h3>
                <p className="text-xs text-neutral-muted">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-text mb-6">
              ¿Seguro que deseas eliminar este reporte? El PDF también se
              eliminará de los archivos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors duration-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

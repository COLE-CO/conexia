import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useSearchParams } from 'react-router-dom';
import CompanySelector from '../components/CompanySelector';
import {
  getBalancesByCompany,
  deleteBalance,
  downloadBalance,
  viewBalance,
} from '../services/balanceService';
import type { Balance } from '../services/balanceService';
import {
  getDeadlinesByCompany,
  confirmDeadline,
  deleteDeadline,
  uploadDeadlineProof,
  getDeadlineProofUrl,
  deleteDeadlineProof,
  regenerateDianCalendar,
  OBLIGATION_LABELS,
} from '../services/deadlineService';
import { toast } from 'sonner';
import type { Deadline, ObligationType } from '../services/deadlineService';
import UploadBalanceModal from '../components/UploadBalanceModal';
import DeadlineCard from '../components/DeadlineCard';
import DeadlineModal from '../components/DeadlineModal';
import ReportModal from '../components/ReportModal';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileSpreadsheet,
  Upload,
  Sparkles,
  Eye,
  Download,
  Trash2,
  CalendarClock,
  Plus,
  ArrowLeft,
} from 'lucide-react';

const metrics = [
  {
    label: 'Ingresos totales',
    value: '$ 0',
    icon: TrendingUp,
    color: 'bg-primary text-white',
  },
  {
    label: 'Gastos totales',
    value: '$ 0',
    icon: TrendingDown,
    color: 'bg-danger/15 text-danger',
  },
  {
    label: 'Utilidad neta',
    value: '$ 0',
    icon: DollarSign,
    color: 'bg-secondary/15 text-secondary',
  },
  {
    label: 'Cartera por cobrar',
    value: '$ 0',
    icon: Users,
    color: 'bg-primary/10 text-primary',
  },
];

type Tab = 'balances' | 'vencimientos' | 'cartera';

const getTabFromParam = (value: string | null): Tab | null => {
  if (value === 'balances' || value === 'vencimientos' || value === 'cartera')
    return value;
  return null;
};

export default function FamilyOfficePage() {
  const { activeCompany, clearActiveCompany } = useCompany();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fuente única de verdad del tab (sin useState)
  const activeTab: Tab = getTabFromParam(searchParams.get('tab')) || 'balances';

  // Balances
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loadedCompanyId, setLoadedCompanyId] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [confirmDeleteBalance, setConfirmDeleteBalance] = useState<
    number | null
  >(null);

  // Reportes IA
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportBalanceId, setReportBalanceId] = useState<number | null>(null);

  // Vencimientos
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loadingDeadlines, setLoadingDeadlines] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [confirmDeleteDeadline, setConfirmDeleteDeadline] = useState<
    number | null
  >(null);
  const [obligationFilter, setObligationFilter] = useState<
    ObligationType | 'all'
  >('all');
  const [regeneratingDian, setRegeneratingDian] = useState(false);

  const availableObligationTypes = Array.from(
    new Set(
      deadlines
        .map((d) => d.obligation_type)
        .filter((t): t is ObligationType => Boolean(t))
    )
  );

  const filteredDeadlines =
    obligationFilter === 'all'
      ? deadlines
      : deadlines.filter((d) => d.obligation_type === obligationFilter);

  const handleRegenerateDian = async () => {
    if (!activeCompany) return;
    setRegeneratingDian(true);
    try {
      const { created } = await regenerateDianCalendar(activeCompany.id);
      const data = await getDeadlinesByCompany(activeCompany.id);
      setDeadlines(sortDeadlines(data));
      toast.success(
        created > 0
          ? `Calendario DIAN regenerado: ${created} obligaciones nuevas`
          : 'El calendario DIAN ya estaba al día'
      );
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'No se pudo regenerar el calendario DIAN';
      toast.error(detail);
    } finally {
      setRegeneratingDian(false);
    }
  };

  const loadingBalances =
    !!activeCompany && loadedCompanyId !== activeCompany.id;
  const visibleBalances = activeCompany ? balances : [];

  const sortDeadlines = (list: Deadline[]) => {
    const pendientes = list
      .filter((d) => d.status === 'pendiente')
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
    const cumplidos = list
      .filter((d) => d.status === 'cumplido')
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
    return [...pendientes, ...cumplidos];
  };

  const hasNewObligationAction =
    searchParams.get('action') === 'new-obligation' &&
    activeTab === 'vencimientos' &&
    !!activeCompany;

  const isDeadlineModalVisible = showDeadlineModal || hasNewObligationAction;
  const effectiveEditingDeadline = hasNewObligationAction
    ? null
    : editingDeadline;

  useEffect(() => {
    if (!hasNewObligationAction) return;

    const next = new URLSearchParams(searchParams);
    next.delete('action');
    setSearchParams(next, { replace: true });
  }, [hasNewObligationAction, searchParams, setSearchParams]);

  // Cargar balances
  useEffect(() => {
    if (!activeCompany) return;
    const currentCompanyId = activeCompany.id;
    let cancelled = false;

    getBalancesByCompany(currentCompanyId)
      .then((data) => {
        if (!cancelled) setBalances(data);
      })
      .catch(() => {
        if (!cancelled) setBalances([]);
      })
      .finally(() => {
        if (!cancelled) setLoadedCompanyId(currentCompanyId);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCompany]);

  // Cargar vencimientos
  useEffect(() => {
    if (!activeCompany) return;
    let cancelled = false;

    const loadDeadlines = async () => {
      setLoadingDeadlines(true);

      try {
        const data = await getDeadlinesByCompany(activeCompany.id);
        if (!cancelled) {
          setDeadlines(sortDeadlines(data));
        }
      } catch {
        if (!cancelled) {
          setDeadlines([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingDeadlines(false);
        }
      }
    };

    void loadDeadlines();

    return () => {
      cancelled = true;
    };
  }, [activeCompany]);

  const handleDeleteBalance = async (balanceId: number) => {
    await deleteBalance(balanceId);
    setBalances((prev) => prev.filter((b) => b.id !== balanceId));
    setConfirmDeleteBalance(null);
  };

  const handleViewBalance = async (balanceId: number, fileName: string) => {
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    if (isExcel) {
      await downloadBalance(balanceId);
      return;
    }
    const url = await viewBalance(balanceId);
    window.open(url, '_blank');
  };

  const handleConfirmDeadline = async (id: number) => {
    try {
      await confirmDeadline(id);
      if (activeCompany) {
        getDeadlinesByCompany(activeCompany.id)
          .then((data) => setDeadlines(sortDeadlines(data)))
          .catch(() => setDeadlines([]));
      }
      toast.success('Vencimiento marcado como cumplido');
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'No se pudo confirmar el vencimiento';
      toast.error(detail);
    }
  };

  const handleDeleteDeadline = async (id: number) => {
    await deleteDeadline(id);
    setDeadlines((prev) => sortDeadlines(prev.filter((d) => d.id !== id)));
    setConfirmDeleteDeadline(null);
  };

  const handleUploadDeadlineProof = async (id: number, file: File) => {
    try {
      const updated = await uploadDeadlineProof(id, file);
      setDeadlines((prev) =>
        sortDeadlines(prev.map((d) => (d.id === id ? updated : d)))
      );
      toast.success('Comprobante subido correctamente');
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'No se pudo subir el comprobante';
      toast.error(detail);
    }
  };

  const handleDownloadDeadlineProof = async (id: number) => {
    try {
      const { url } = await getDeadlineProofUrl(id);
      window.open(url, '_blank');
    } catch {
      toast.error('No se pudo descargar el comprobante');
    }
  };

  const handleRemoveDeadlineProof = async (id: number) => {
    try {
      const updated = await deleteDeadlineProof(id);
      setDeadlines((prev) =>
        sortDeadlines(prev.map((d) => (d.id === id ? updated : d)))
      );
      toast.success('Comprobante eliminado');
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'No se pudo eliminar el comprobante';
      toast.error(detail);
    }
  };

  const handleDeadlineSuccess = (deadline: Deadline) => {
    if (editingDeadline) {
      setDeadlines((prev) =>
        sortDeadlines(prev.map((d) => (d.id === deadline.id ? deadline : d)))
      );
    } else {
      setDeadlines((prev) => sortDeadlines([...prev, deadline]));
    }
    setShowDeadlineModal(false);
    setEditingDeadline(null);
  };

  return (
    <div className="p-8 min-h-screen bg-neutral-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 w-80 h-80 rounded-full bg-secondary/7 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-primary/6 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-text font-hubot tracking-tight">
            Family Office
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Balances generales, reportes con IA, vencimientos y cartera de
            clientes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setReportBalanceId(null);
              setShowReportModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-border bg-neutral-surface text-neutral-text text-sm hover:bg-neutral-bg transition-colors duration-200 shadow-sm"
          >
            <Sparkles size={16} />
            Generar reporte IA
          </button>
          <div className={activeTab === 'balances' ? 'block' : 'hidden'}>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center gap-2 min-w-[180px] px-4 py-2 rounded-lg bg-primary text-white text-sm ..."
            >
              <Upload size={16} />
              Subir balance
            </button>
          </div>
          <div
            className={
              activeTab === 'vencimientos'
                ? 'flex items-center gap-2'
                : 'hidden'
            }
          >
            {activeCompany?.nit && (
              <button
                onClick={handleRegenerateDian}
                disabled={regeneratingDian}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-border bg-neutral-surface text-neutral-text text-sm hover:bg-neutral-bg transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenera las obligaciones DIAN faltantes según el NIT"
              >
                <CalendarClock size={16} />
                {regeneratingDian ? 'Regenerando…' : 'Regenerar DIAN'}
              </button>
            )}
            <button
              onClick={() => {
                setEditingDeadline(null);
                setShowDeadlineModal(true);
              }}
              className="flex items-center justify-center gap-2 min-w-[180px] px-4 py-2 rounded-lg bg-primary text-white text-sm ..."
            >
              <Plus size={16} />
              Nueva obligación
            </button>
          </div>
        </div>
      </div>

      {/* Selector de empresa */}
      <div className="relative z-40 flex items-center gap-3 mb-6">
        <button
          onClick={() => clearActiveCompany()}
          className="p-1.5 rounded-lg text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg border border-transparent hover:border-neutral-border transition-all duration-200"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-muted">Empresa</span>
          <CompanySelector />
        </div>
      </div>

      {/* Métricas */}
      <div className="relative z-10 grid grid-cols-4 gap-4 mb-6">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-neutral-surface border border-neutral-border rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div
              className={`${color} rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0`}
            >
              <Icon size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-text">{value}</p>
              <p className="text-xs text-neutral-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border border-neutral-border rounded-xl p-1 w-fit bg-neutral-surface shadow-sm">
        {(['balances', 'vencimientos', 'cartera'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set('tab', tab);
              next.delete('action');
              setSearchParams(next, { replace: true });
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200
              ${
                activeTab === tab
                  ? 'bg-neutral-bg text-neutral-text border border-neutral-border shadow-sm'
                  : 'text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg/60'
              }
            `}
          >
            {tab === 'balances' && (
              <span className="inline-flex items-center gap-1.5">
                <FileSpreadsheet size={15} /> Balances
              </span>
            )}
            {tab === 'vencimientos' && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock size={15} /> Vencimientos
              </span>
            )}
            {tab === 'cartera' && (
              <span className="inline-flex items-center gap-1.5">
                <Users size={15} /> Cartera
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Balances */}
      <div className={activeTab === 'balances' ? 'block' : 'hidden'}>
        {loadingBalances ? (
          <div className="text-center py-12 text-neutral-muted text-sm animate-pulse">
            Cargando balances...
          </div>
        ) : visibleBalances.length === 0 ? (
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-neutral-bg border border-neutral-border flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet size={24} className="text-neutral-muted" />
            </div>
            <p className="text-sm font-semibold text-neutral-text mb-1">
              No hay balances cargados
            </p>
            <p className="text-xs text-neutral-muted mb-6">
              {activeCompany
                ? `Sube el primer balance para ${activeCompany.name}`
                : 'Selecciona una empresa y sube su primer balance'}
            </p>
            {activeCompany && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors duration-200 shadow-md shadow-primary/20"
              >
                <Upload size={15} />
                Subir primer balance
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {visibleBalances.map((balance) => (
              <div
                key={balance.id}
                className="bg-neutral-surface border border-neutral-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-neutral-bg border border-neutral-border rounded-lg w-10 h-10 flex items-center justify-center">
                      <FileSpreadsheet
                        size={18}
                        className="text-neutral-muted"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-text">
                        {balance.file_name}
                      </p>
                      <p className="text-xs text-neutral-muted">
                        {activeCompany?.name} · {balance.year}
                        {balance.month ? `/${balance.month}` : ''} · Subido{' '}
                        {String(balance.uploaded_at).slice(0, 10)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleViewBalance(balance.id, balance.file_name)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
                  >
                    <Eye size={15} /> Ver datos
                  </button>
                  <button
                    onClick={() => downloadBalance(balance.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
                  >
                    <Download size={15} /> Exportar
                  </button>
                  <button
                    onClick={() => {
                      setReportBalanceId(balance.id);
                      setShowReportModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-secondary/30 text-sm text-secondary hover:bg-secondary/5 transition-colors duration-200"
                  >
                    <Sparkles size={15} /> Reporte IA
                  </button>
                  <button
                    onClick={() => setConfirmDeleteBalance(balance.id)}
                    className="p-1.5 rounded-lg border border-neutral-border text-red-400 hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tab Vencimientos */}
      <div className={activeTab === 'vencimientos' ? 'block' : 'hidden'}>
        {loadingDeadlines ? (
          <div className="text-center py-12 text-neutral-muted text-sm animate-pulse">
            Cargando vencimientos...
          </div>
        ) : deadlines.length === 0 ? (
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-12 text-center shadow-sm">
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-neutral-bg border border-neutral-border flex items-center justify-center mx-auto mb-4">
                <CalendarClock size={24} className="text-neutral-muted" />
              </div>
              <p className="text-sm font-semibold text-neutral-text mb-1">
                No hay obligaciones registradas
              </p>
              <p className="text-xs text-neutral-muted mb-6">
                {activeCompany
                  ? `Crea la primera obligación para ${activeCompany.name}`
                  : 'Selecciona una empresa'}
              </p>
              {activeCompany && (
                <button
                  onClick={() => {
                    setEditingDeadline(null);
                    setShowDeadlineModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors duration-200 shadow-md shadow-primary/20"
                >
                  <Plus size={15} />
                  Nueva obligación
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold text-neutral-text">
                Obligaciones fiscales y vencimientos
              </h2>
              {availableObligationTypes.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setObligationFilter('all')}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      obligationFilter === 'all'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-neutral-surface text-neutral-muted border-neutral-border hover:bg-neutral-bg'
                    }`}
                  >
                    Todas
                  </button>
                  {availableObligationTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setObligationFilter(t)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        obligationFilter === t
                          ? 'bg-primary text-white border-primary'
                          : 'bg-neutral-surface text-neutral-muted border-neutral-border hover:bg-neutral-bg'
                      }`}
                    >
                      {OBLIGATION_LABELS[t]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-border">
                  <th className="py-3 px-4 text-xs text-neutral-muted font-medium text-left">
                    Obligación
                  </th>
                  <th className="py-3 px-4 text-xs text-neutral-muted font-medium text-left">
                    Empresa
                  </th>
                  <th className="py-3 px-4 text-xs text-neutral-muted font-medium text-left">
                    Vencimiento
                  </th>
                  <th className="py-3 px-4 text-xs text-neutral-muted font-medium text-left">
                    Estado
                  </th>
                  <th className="py-3 px-4 text-xs text-neutral-muted font-medium text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filteredDeadlines.map((deadline) => (
                  <DeadlineCard
                    key={deadline.id}
                    deadline={deadline}
                    companyName={activeCompany?.name}
                    onConfirm={handleConfirmDeadline}
                    onEdit={(d) => {
                      setEditingDeadline(d);
                      setShowDeadlineModal(true);
                    }}
                    onDelete={(id) => setConfirmDeleteDeadline(id)}
                    onUploadProof={handleUploadDeadlineProof}
                    onDownloadProof={handleDownloadDeadlineProof}
                    onRemoveProof={handleRemoveDeadlineProof}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tab Cartera */}
      <div className={activeTab === 'cartera' ? 'block' : 'hidden'}>
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 text-center text-neutral-muted text-sm shadow-sm">
          Módulo de cartera próximamente.
        </div>
      </div>

      {/* Modal reporte IA */}
      {showReportModal && (
        <ReportModal
          onClose={() => {
            setShowReportModal(false);
            setReportBalanceId(null);
          }}
          balanceId={reportBalanceId ?? undefined}
          balances={visibleBalances}
        />
      )}

      {/* Modal subir balance */}
      {showUploadModal && (
        <UploadBalanceModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={(newBalance: Balance) => {
            setBalances((prev) => [newBalance, ...prev]);
            setShowUploadModal(false);
          }}
        />
      )}

      {/* Modal crear/editar vencimiento */}
      {isDeadlineModalVisible && (
        <DeadlineModal
          onClose={() => {
            setShowDeadlineModal(false);
            setEditingDeadline(null);
          }}
          onSuccess={handleDeadlineSuccess}
          editing={effectiveEditingDeadline}
        />
      )}

      {/* Modal confirmar eliminar balance */}
      {confirmDeleteBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-text">
                  Eliminar balance
                </h3>
                <p className="text-xs text-neutral-muted">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-text mb-6">
              ¿Seguro que deseas eliminar este balance? El archivo también se
              eliminará de la base de datos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteBalance(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteBalance(confirmDeleteBalance)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors duration-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar vencimiento */}
      {confirmDeleteDeadline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-text">
                  Eliminar obligación
                </h3>
                <p className="text-xs text-neutral-muted">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-text mb-6">
              ¿Seguro que deseas eliminar esta obligación?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteDeadline(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteDeadline(confirmDeleteDeadline)}
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

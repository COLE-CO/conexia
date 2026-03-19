import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import CompanySelector from '../components/CompanySelector';
import {
  getBalancesByCompany,
  deleteBalance,
} from '../services/balanceService';
import type { Balance } from '../services/balanceService';
import UploadBalanceModal from '../components/UploadBalanceModal';
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
  Triangle,
  CalendarClock,
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

export default function FamilyOfficePage() {
  const { activeCompany } = useCompany();
  const [activeTab, setActiveTab] = useState<Tab>('balances');
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loadedCompanyId, setLoadedCompanyId] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadingBalances =
    !!activeCompany && loadedCompanyId !== activeCompany.id;
  const visibleBalances = activeCompany ? balances : [];

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

  const handleDelete = async (balanceId: number) => {
    if (!confirm('¿Seguro que deseas eliminar este balance?')) return;
    await deleteBalance(balanceId);
    setBalances((prev) => prev.filter((b) => b.id !== balanceId));
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
      <div className="relative flex items-start justify-between mb-6 animate-fade-in-up">
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-border bg-neutral-surface text-neutral-text text-sm hover:bg-neutral-bg transition-colors duration-200 shadow-sm">
            <Sparkles size={16} />
            Generar reporte IA
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-hover transition-colors duration-200 shadow-md"
          >
            <Upload size={16} />
            Subir balance
          </button>
        </div>
      </div>

      {/* Selector de empresa */}
      <div className="relative z-40 flex items-center gap-3 mb-6 animate-fade-in-up animation-delay-80">
        <Triangle size={16} className="text-neutral-muted rotate-180" />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-muted">Empresa</span>
          <CompanySelector />
        </div>
      </div>

      {/* Métricas */}
      <div className="relative z-10 grid grid-cols-4 gap-4 mb-6 animate-fade-in-up animation-delay-120">
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
      <div className="flex items-center gap-1 mb-6 border border-neutral-border rounded-xl p-1 w-fit bg-neutral-surface shadow-sm animate-fade-in-up animation-delay-160">
        {(['balances', 'vencimientos', 'cartera'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200
              ${
                activeTab === tab
                  ? 'bg-neutral-bg text-neutral-text border border-neutral-border shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_1px_2px_rgba(10,22,40,0.14)]'
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

      {/* Contenido tabs */}
      {activeTab === 'balances' &&
        (loadingBalances ? (
          <div className="text-center py-12 text-neutral-muted text-sm animate-pulse">
            Cargando balances...
          </div>
        ) : visibleBalances.length === 0 ? (
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-8 text-center shadow-sm animate-fade-in-up animation-delay-200">
            <FileSpreadsheet
              size={32}
              className="text-neutral-muted mx-auto mb-3"
            />
            <p className="text-sm font-medium text-neutral-text mb-1">
              No hay balances cargados
            </p>
            <p className="text-xs text-neutral-muted">
              {activeCompany
                ? `Sube el primer balance para ${activeCompany.name}`
                : 'Selecciona una empresa y sube su primer balance'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up animation-delay-200">
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
                  <a
                    href={balance.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
                  >
                    <Eye size={15} /> Ver datos
                  </a>
                  <a
                    href={balance.file_url}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
                  >
                    <Download size={15} /> Exportar
                  </a>
                  <button
                    onClick={() => handleDelete(balance.id)}
                    className="p-1.5 rounded-lg border border-neutral-border text-red-400 hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {activeTab === 'vencimientos' && (
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 text-center text-neutral-muted text-sm shadow-sm animate-fade-in-up animation-delay-200">
          Módulo de vencimientos próximamente.
        </div>
      )}

      {activeTab === 'cartera' && (
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 text-center text-neutral-muted text-sm shadow-sm animate-fade-in-up animation-delay-200">
          Módulo de cartera próximamente.
        </div>
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
    </div>
  );
}

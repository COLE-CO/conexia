import { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import CompanySelector from '../components/CompanySelector';
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
} from 'lucide-react';

interface Balance {
  id: number;
  name: string;
  company: string;
  type: string;
  date: string;
}

const metrics = [
  { label: 'Ingresos totales', value: '$ 0', icon: TrendingUp, color: 'bg-primary text-white' },
  { label: 'Gastos totales', value: '$ 0', icon: TrendingDown, color: 'bg-red-50 text-red-400' },
  { label: 'Utilidad neta', value: '$ 0', icon: DollarSign, color: 'bg-gray-100 text-gray-500' },
  { label: 'Cartera por cobrar', value: '$ 0', icon: Users, color: 'bg-blue-50 text-blue-400' },
];

type Tab = 'balances' | 'vencimientos' | 'cartera';

export default function FamilyOfficePage() {
  const { activeCompany } = useCompany();
  const [activeTab, setActiveTab] = useState<Tab>('balances');
  const [balances] = useState<Balance[]>([]);

  return (
    <div className="p-8 min-h-screen bg-neutral-bg">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-text font-hubot">Family Office</h1>
          <p className="text-sm text-neutral-muted mt-1">
            Balances generales, reportes con IA, vencimientos y cartera de clientes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-border bg-neutral-surface text-neutral-text text-sm hover:bg-neutral-bg transition-colors duration-200">
            <Sparkles size={16} />
            Generar reporte IA
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-hover transition-colors duration-200">
            <Upload size={16} />
            Subir balance
          </button>
        </div>
      </div>

      {/* Selector de empresa */}
      <div className="flex items-center gap-3 mb-6">
        <Triangle size={16} className="text-neutral-muted rotate-180" />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-muted">Empresa</span>
          <CompanySelector />
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-neutral-surface border border-neutral-border rounded-xl p-4 flex items-center gap-4">
            <div className={`${color} rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0`}>
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
      <div className="flex items-center gap-1 mb-6 border border-neutral-border rounded-lg p-1 w-fit bg-neutral-surface">
        {(['balances', 'vencimientos', 'cartera'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors duration-200
              ${activeTab === tab
                ? 'bg-neutral-bg text-neutral-text shadow-sm border border-neutral-border'
                : 'text-neutral-muted hover:text-neutral-text'}
            `}
          >
            {tab === 'balances' && '🗒 Balances'}
            {tab === 'vencimientos' && '⚠ Vencimientos'}
            {tab === 'cartera' && '👥 Cartera'}
          </button>
        ))}
      </div>

      {/* Contenido tabs */}
      {activeTab === 'balances' && (
        balances.length === 0 ? (
          <div className="bg-neutral-surface border border-neutral-border rounded-xl p-8 text-center">
            <FileSpreadsheet size={32} className="text-neutral-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-text mb-1">No hay balances cargados</p>
            <p className="text-xs text-neutral-muted">
              {activeCompany
                ? `Sube el primer balance para ${activeCompany.name}`
                : 'Selecciona una empresa y sube su primer balance'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {balances.map(balance => (
              <div key={balance.id} className="bg-neutral-surface border border-neutral-border rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-neutral-bg border border-neutral-border rounded-lg w-10 h-10 flex items-center justify-center">
                      <FileSpreadsheet size={18} className="text-neutral-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-text">{balance.name}</p>
                      <p className="text-xs text-neutral-muted">
                        {balance.company} · {balance.type} · Subido {balance.date}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-neutral-bg border border-neutral-border text-neutral-text">
                    {balance.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200">
                    <Eye size={14} /> Ver datos
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200">
                    <Download size={14} /> Exportar
                  </button>
                  <button className="p-1.5 rounded-lg border border-neutral-border text-red-400 hover:bg-red-50 transition-colors duration-200">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'vencimientos' && (
        <div className="bg-neutral-surface border border-neutral-border rounded-xl p-6 text-center text-neutral-muted text-sm">
          Módulo de vencimientos próximamente.
        </div>
      )}

      {activeTab === 'cartera' && (
        <div className="bg-neutral-surface border border-neutral-border rounded-xl p-6 text-center text-neutral-muted text-sm">
          Módulo de cartera próximamente.
        </div>
      )}

    </div>
  );
}
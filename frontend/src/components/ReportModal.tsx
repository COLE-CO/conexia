import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Sparkles,
  FileSpreadsheet,
  Plus,
  Trash2,
  FileDown,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Balance } from '../services/balanceService';
import {
  generateReport,
  exportReportPDF,
  saveReport,
} from '../services/reportService';
import type {
  FinancialRatios,
  FinancialSnapshot,
  LineItem,
  ReportData,
} from '../services/reportService';
import { useCompany } from '../context/CompanyContext';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { appendStoredNotificationEvent } from '../services/notificationEventService';

interface Props {
  onClose: () => void;
  balanceId?: number;
  balances: Balance[];
  onReportSaved?: () => void;
}

type Step = 'select' | 'loading' | 'ready';

export default function ReportModal({
  onClose,
  balanceId,
  balances,
  onReportSaved,
}: Props) {
  const { activeCompany } = useCompany();
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState<Step>(balanceId ? 'loading' : 'select');
  const [error, setError] = useState<string | null>(null);
  const [selectedBalanceId, setSelectedBalanceId] = useState<number | null>(
    balanceId ?? null
  );

  const [items, setItems] = useState<LineItem[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [period, setPeriod] = useState('');
  const [exporting, setExporting] = useState(false);
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
  const [ratios, setRatios] = useState<FinancialRatios | null>(null);
  const [findings, setFindings] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const totals = useMemo(() => {
    const totalIncome = items
      .filter((i) => i.category === 'ingreso')
      .reduce((s, i) => s + i.amount, 0);
    const totalExpenses = items
      .filter((i) => i.category === 'gasto')
      .reduce((s, i) => s + i.amount, 0);
    return {
      totalIncome,
      totalExpenses,
      netResult: totalIncome - totalExpenses,
    };
  }, [items]);

  const incomeItems = useMemo(
    () => items.filter((i) => i.category === 'ingreso'),
    [items]
  );
  const expenseItems = useMemo(
    () => items.filter((i) => i.category === 'gasto'),
    [items]
  );

  const handleGenerate = async (id: number) => {
    setSelectedBalanceId(id);
    setStep('loading');
    setError(null);
    try {
      const data: ReportData = await generateReport(id);
      setItems(data.items);
      setAiSummary(data.ai_summary);
      setCompanyName(data.company_name);
      setPeriod(data.period);
      setSnapshot(data.snapshot ?? null);
      setRatios(data.ratios ?? null);
      setFindings(data.findings ?? []);
      setRecommendations(data.recommendations ?? []);
      if (user?.id) {
        appendStoredNotificationEvent(user.id, {
          id: `report-${selectedBalanceId}-${Date.now()}`,
          type: 'report',
          title: `Reporte generado: ${data.company_name}`,
          message: `Se generó un resumen con IA para el periodo ${data.period}.`,
          isoDate: new Date().toISOString(),
          companyId: activeCompany?.id,
          companyName: data.company_name,
        });
      }
      setStep('ready');
    } catch {
      setError(
        'No se pudo generar el reporte. Verifica que el balance contenga datos válidos e intenta de nuevo.'
      );
      setStep('select');
    }
  };

  useEffect(() => {
    if (balanceId) handleGenerate(balanceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExportPDF = async () => {
    setExporting(true);
    setError(null);
    try {
      await exportReportPDF({
        company_name: companyName,
        company_nit: activeCompany?.nit,
        period,
        items,
        total_income: totals.totalIncome,
        total_expenses: totals.totalExpenses,
        net_result: totals.netResult,
        ai_summary: aiSummary,
        snapshot,
        ratios,
        findings,
        recommendations,
      });

      if (activeCompany) {
        await saveReport({
          company_id: activeCompany.id,
          balance_id: selectedBalanceId ?? undefined,
          company_name: companyName,
          company_nit: activeCompany.nit,
          period,
          ai_summary: aiSummary,
          total_income: totals.totalIncome,
          total_expenses: totals.totalExpenses,
          net_result: totals.netResult,
          items,
          snapshot,
          ratios,
          findings,
          recommendations,
        });
        toast.success('Reporte guardado correctamente', {
          description: `${companyName} · ${period}`,
        });
        onReportSaved?.();
      }
    } catch {
      setError('Error al generar el PDF. Intenta de nuevo.');
      toast.error('Error al exportar el PDF');
    } finally {
      setExporting(false);
    }
  };

  const updateItem = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));
  const addItem = (category: 'ingreso' | 'gasto') => {
    setItems((prev) => [
      ...prev,
      { concept: '', amount: 0, category, subcategory: '' },
    ]);
  };
  const formatCurrency = (value: number) =>
    `$ ${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;

  if (step === 'select') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-neutral-text font-hubot">
              Generar reporte con IA
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-muted hover:text-neutral-text bg-transparent border-none cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-neutral-muted mb-4">
            Selecciona un balance para analizar con inteligencia artificial.
          </p>
          {error && <p className="text-xs text-red-400 mb-4">{error}</p>}
          {balances.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-neutral-bg border border-neutral-border flex items-center justify-center mx-auto mb-3">
                <FileSpreadsheet size={20} className="text-neutral-muted" />
              </div>
              <p className="text-sm text-neutral-muted">
                No hay balances disponibles para analizar.
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 mb-4">
              {balances.map((balance) => (
                <button
                  key={balance.id}
                  onClick={() => handleGenerate(balance.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-border bg-neutral-bg hover:border-secondary hover:bg-secondary/5 transition-all duration-200 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-neutral-surface border border-neutral-border flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet size={16} className="text-neutral-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-text truncate">
                      {balance.file_name}
                    </p>
                    <p className="text-xs text-neutral-muted">
                      {balance.year}
                      {balance.month ? `/${balance.month}` : ''} · Subido{' '}
                      {String(balance.uploaded_at).slice(0, 10)}
                    </p>
                  </div>
                  <Sparkles
                    size={16}
                    className="text-secondary flex-shrink-0"
                  />
                </button>
              ))}
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-2xl w-full max-w-md p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
            <Loader2 size={28} className="text-secondary animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-neutral-text font-hubot mb-2">
            Analizando balance con IA
          </h2>
          <p className="text-sm text-neutral-muted">
            Clasificando ingresos y gastos. Esto puede tomar unos segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-neutral-surface border border-neutral-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-neutral-text font-hubot">
              Reporte IA — {companyName}
            </h2>
            <p className="text-xs text-neutral-muted">{period}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-muted hover:text-neutral-text bg-transparent border-none cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-xs text-green-700 font-medium">
                  Total Ingresos
                </span>
              </div>
              <p className="text-xl font-bold text-green-700">
                {formatCurrency(totals.totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={16} className="text-red-600" />
                <span className="text-xs text-red-700 font-medium">
                  Total Gastos
                </span>
              </div>
              <p className="text-xl font-bold text-red-700">
                {formatCurrency(totals.totalExpenses)}
              </p>
            </div>
            <div
              className={`border rounded-xl p-4 ${totals.netResult >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <DollarSign
                  size={16}
                  className={
                    totals.netResult >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }
                />
                <span
                  className={`text-xs font-medium ${totals.netResult >= 0 ? 'text-blue-700' : 'text-orange-700'}`}
                >
                  Resultado Neto
                </span>
              </div>
              <p
                className={`text-xl font-bold ${totals.netResult >= 0 ? 'text-blue-700' : 'text-orange-700'}`}
              >
                {formatCurrency(totals.netResult)}
              </p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs text-neutral-muted mb-2 font-medium">
              <Pencil size={13} /> Resumen del análisis (editable)
            </label>
            <textarea
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-neutral-border bg-neutral-bg text-sm text-neutral-text focus:outline-none focus:border-secondary resize-none leading-relaxed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-green-700 flex items-center gap-1.5">
                <TrendingUp size={15} /> Ingresos ({incomeItems.length})
              </h3>
              <button
                onClick={() => addItem('ingreso')}
                className="flex items-center gap-1 text-xs text-secondary hover:text-secondary/80 font-medium"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>
            {incomeItems.length > 0 ? (
              <div className="border border-neutral-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-50 border-b border-neutral-border">
                      <th className="py-2.5 px-3 text-xs text-green-700 font-medium text-left">
                        Concepto
                      </th>
                      <th className="py-2.5 px-3 text-xs text-green-700 font-medium text-left">
                        Subcategoría
                      </th>
                      <th className="py-2.5 px-3 text-xs text-green-700 font-medium text-right">
                        Monto
                      </th>
                      <th className="py-2.5 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(
                      (item, idx) =>
                        item.category === 'ingreso' && (
                          <tr
                            key={idx}
                            className="border-b border-neutral-border last:border-b-0 hover:bg-neutral-bg/50"
                          >
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.concept}
                                onChange={(e) =>
                                  updateItem(idx, 'concept', e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-neutral-border focus:border-secondary bg-transparent text-sm text-neutral-text focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.subcategory}
                                onChange={(e) =>
                                  updateItem(idx, 'subcategory', e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-neutral-border focus:border-secondary bg-transparent text-sm text-neutral-text focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={item.amount}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    'amount',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-neutral-border focus:border-secondary bg-transparent text-sm text-neutral-text focus:outline-none text-right"
                              />
                            </td>
                            <td className="py-2 px-1">
                              <button
                                onClick={() => removeItem(idx)}
                                className="p-1 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-neutral-muted py-4 text-center border border-dashed border-neutral-border rounded-xl">
                No hay ingresos clasificados.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                <TrendingDown size={15} /> Gastos ({expenseItems.length})
              </h3>
              <button
                onClick={() => addItem('gasto')}
                className="flex items-center gap-1 text-xs text-secondary hover:text-secondary/80 font-medium"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>
            {expenseItems.length > 0 ? (
              <div className="border border-neutral-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-red-50 border-b border-neutral-border">
                      <th className="py-2.5 px-3 text-xs text-red-700 font-medium text-left">
                        Concepto
                      </th>
                      <th className="py-2.5 px-3 text-xs text-red-700 font-medium text-left">
                        Subcategoría
                      </th>
                      <th className="py-2.5 px-3 text-xs text-red-700 font-medium text-right">
                        Monto
                      </th>
                      <th className="py-2.5 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(
                      (item, idx) =>
                        item.category === 'gasto' && (
                          <tr
                            key={idx}
                            className="border-b border-neutral-border last:border-b-0 hover:bg-neutral-bg/50"
                          >
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.concept}
                                onChange={(e) =>
                                  updateItem(idx, 'concept', e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-neutral-border focus:border-secondary bg-transparent text-sm text-neutral-text focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.subcategory}
                                onChange={(e) =>
                                  updateItem(idx, 'subcategory', e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-neutral-border focus:border-secondary bg-transparent text-sm text-neutral-text focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={item.amount}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    'amount',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-neutral-border focus:border-secondary bg-transparent text-sm text-neutral-text focus:outline-none text-right"
                              />
                            </td>
                            <td className="py-2 px-1">
                              <button
                                onClick={() => removeItem(idx)}
                                className="p-1 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-neutral-muted py-4 text-center border border-dashed border-neutral-border rounded-xl">
                No hay gastos clasificados.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-border flex-shrink-0">
          <p className="text-xs text-neutral-muted">
            Puedes editar cualquier campo antes de exportar. El reporte se
            guardará automáticamente.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-neutral-border text-sm text-neutral-text hover:bg-neutral-bg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting || items.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
            >
              <FileDown size={16} />
              {exporting ? 'Guardando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

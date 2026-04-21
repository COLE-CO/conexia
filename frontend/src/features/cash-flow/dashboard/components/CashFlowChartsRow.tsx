import type { FC } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { CashFlowDashboardMetrics } from '../types';

interface CashFlowChartsRowProps {
  metrics: CashFlowDashboardMetrics;
  loading: boolean;
}

interface TooltipPayloadEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

const COLORES_CUENTA = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
];

const formatMillones = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
};

const formatCOP = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

const TooltipFlujo: FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-neutral-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.dataKey}
          style={{ color: entry.color }}
          className="flex gap-2 justify-between"
        >
          <span>{entry.name}</span>
          <span className="font-medium">{formatMillones(entry.value)}</span>
        </p>
      ))}
    </div>
  );
};

const TooltipDonut: FC<TooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-neutral-700">{name}</p>
      <p className="text-neutral-500 mt-1">{formatCOP(value)}</p>
    </div>
  );
};

const CashFlowChartsRow: FC<CashFlowChartsRowProps> = ({
  metrics,
  loading,
}) => {
  const datosFlujo =
    metrics.puntosFlujo.length > 0
      ? metrics.puntosFlujo
      : [{ fecha: '—', ingresos: 0, egresos: 0, saldo: 0 }];

  const datosDonut = metrics.cuentas.map((c, i) => ({
    name: c.nombre,
    value: c.saldo,
    color: COLORES_CUENTA[i % COLORES_CUENTA.length],
  }));

  const chartSkeleton = (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-44 bg-neutral-border rounded" />
        <div className="h-3 w-16 bg-neutral-border rounded" />
      </div>
      <div className="h-52 bg-neutral-border rounded-xl" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
      {/* Gráfico de área */}
      <div className="bg-neutral-surface rounded-2xl border border-neutral-border p-6 shadow-sm">
        {loading ? (
          chartSkeleton
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">
                  Flujo de caja
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Ingresos y egresos en el tiempo
                </p>
              </div>
              <span className="text-xs text-neutral-400 font-medium">
                {metrics.totalMovimientos} movimientos
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={datosFlujo}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradIngreso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEgreso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatMillones}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<TooltipFlujo />} />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gradIngreso)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="egresos"
                  name="Egresos"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#gradEgreso)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Ingresos
              </span>
              <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                Egresos
              </span>
            </div>
          </>
        )}
      </div>

      {/* Donut */}
      <div className="bg-neutral-surface rounded-2xl border border-neutral-border p-6 shadow-sm">
        {loading ? (
          chartSkeleton
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">
                  Distribución por cuenta
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Peso relativo del saldo disponible
                </p>
              </div>
              <span className="text-xs text-neutral-400 font-medium">
                {metrics.cuentasActivas} cuentas
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={datosDonut}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {datosDonut.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipDonut />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: '8px',
                    fontSize: '11px',
                    lineHeight: '20px',
                  }}
                  formatter={(value) => (
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default CashFlowChartsRow;

import { useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { DashboardMetrics } from '../types';
import ChartSkeleton from './ChartSkeleton';

const DONUT_COLORS = ['#3B82F6', '#EF4444', '#22C55E'];
const PAGE_SIZE = 4;

interface ChartsRowProps {
  loading: boolean;
  dashboard: DashboardMetrics;
  deadlinesCount: number;
}

export default function ChartsRow({
  loading,
  dashboard,
  deadlinesCount,
}: ChartsRowProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(dashboard.barData.length / PAGE_SIZE);
  const paginatedData = dashboard.barData.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {loading ? (
        <>
          <ChartSkeleton />
          <ChartSkeleton />
        </>
      ) : (
        <>
          {/* Donut chart — unchanged */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-neutral-text">
                Distribución de obligaciones
              </h2>
              <span className="text-xs text-neutral-muted">
                {deadlinesCount} total
              </span>
            </div>
            {dashboard.donutData.length === 0 ? (
              <div className="flex items-center justify-center h-52 text-sm text-neutral-muted">
                Sin datos disponibles.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dashboard.donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dashboard.donutData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      value ?? 0,
                      String(name ?? ''),
                    ]}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar chart — with pagination */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-neutral-text">
                Obligaciones por empresa
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-muted">
                  {dashboard.barData.length} empresas
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-1 rounded-lg border border-neutral-border text-neutral-muted hover:bg-neutral-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs text-neutral-muted w-10 text-center">
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={page === totalPages - 1}
                      className="p-1 rounded-lg border border-neutral-border text-neutral-muted hover:bg-neutral-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {dashboard.barData.length === 0 ? (
              <div className="flex items-center justify-center h-52 text-sm text-neutral-muted">
                Sin datos disponibles.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={paginatedData} barSize={8} barGap={3}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  />
                  <Bar
                    dataKey="Pendiente"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="Vencido" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="Cumplido"
                    fill="#22C55E"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}

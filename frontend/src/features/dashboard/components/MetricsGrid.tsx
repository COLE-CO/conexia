import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';

import type { DashboardMetrics, DateRangeOption } from '../types';
import CardSkeleton from './CardSkeleton';
import StatCard from './StatCard';

interface MetricsGridProps {
  loading: boolean;
  dashboard: DashboardMetrics;
  dateRange: DateRangeOption;
}

export default function MetricsGrid({
  loading,
  dashboard,
  dateRange,
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
      ) : (
        <>
          <StatCard
            label="Pagos pendientes"
            value={dashboard.pendingCount}
            description="Obligaciones pendientes por completar."
            icon={<ClipboardList size={17} />}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            borderColorClass="border-primary/40"
          />
          <StatCard
            label="Vencimientos próximos"
            value={dashboard.upcomingCount}
            description={`Vencen en los próximos ${dateRange} días.`}
            icon={<CalendarClock size={17} />}
            iconBg="bg-secondary/15"
            iconColor="text-secondary"
            borderColorClass="border-secondary/40"
          />
          <StatCard
            label="Alertas vencidas"
            value={dashboard.overdueCount}
            description="Obligaciones vencidas sin confirmar."
            icon={<AlertTriangle size={17} />}
            iconBg="bg-red-100"
            iconColor="text-red-500"
            borderColorClass="border-red-300"
            critical
          />
          <StatCard
            label="Cumplidas"
            value={dashboard.completedCount}
            description="Historial confirmado en el módulo."
            icon={<CheckCircle2 size={17} />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            borderColorClass="border-green-300"
          />
        </>
      )}
    </div>
  );
}

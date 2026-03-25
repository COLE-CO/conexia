import { useMemo } from 'react';

import type {
  DashboardMetrics,
  DateRangeOption,
  DeadlineWithCompany,
} from '../types';

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function useDashboardMetrics(
  deadlines: DeadlineWithCompany[],
  dateRange: DateRangeOption
): DashboardMetrics {
  return useMemo(() => {
    const today = startOfDay(new Date());
    const upcomingLimit = new Date(today);
    upcomingLimit.setDate(today.getDate() + dateRange);

    const pending = deadlines.filter((d) => d.status === 'pendiente');
    const completed = deadlines.filter((d) => d.status === 'cumplido');

    const overdue = pending.filter((d) => {
      const due = startOfDay(new Date(d.due_date));
      return due < today;
    });

    const upcoming = pending.filter((d) => {
      const due = startOfDay(new Date(d.due_date));
      return due >= today && due <= upcomingLimit;
    });

    const urgentItems = pending
      .filter((d) => {
        const due = startOfDay(new Date(d.due_date));
        return due <= upcomingLimit;
      })
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
      .slice(0, 6);

    const totalUrgent = pending.filter((d) => {
      const due = startOfDay(new Date(d.due_date));
      return due <= upcomingLimit;
    }).length;

    const hiddenCount = totalUrgent - urgentItems.length;

    const donutData = [
      { name: 'Pendientes', value: pending.length - overdue.length },
      { name: 'Vencidas', value: overdue.length },
      { name: 'Cumplidas', value: completed.length },
    ].filter((d) => d.value > 0);

    const companyMap: Record<
      string,
      { pendiente: number; cumplido: number; vencido: number }
    > = {};

    deadlines.forEach((d) => {
      if (!companyMap[d.companyName]) {
        companyMap[d.companyName] = { pendiente: 0, cumplido: 0, vencido: 0 };
      }

      if (d.status === 'cumplido') {
        companyMap[d.companyName].cumplido += 1;
      } else {
        const due = startOfDay(new Date(d.due_date));
        if (due < today) {
          companyMap[d.companyName].vencido += 1;
        } else {
          companyMap[d.companyName].pendiente += 1;
        }
      }
    });

    const barData = Object.entries(companyMap).map(([name, counts]) => ({
      name: name.length > 14 ? name.slice(0, 14) + '…' : name,
      Pendiente: counts.pendiente,
      Vencido: counts.vencido,
      Cumplido: counts.cumplido,
    }));

    return {
      pendingCount: pending.length,
      completedCount: completed.length,
      overdueCount: overdue.length,
      upcomingCount: upcoming.length,
      urgentItems,
      hiddenCount,
      donutData,
      barData,
    };
  }, [deadlines, dateRange]);
}

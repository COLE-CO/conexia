import type { Deadline } from '../../services/deadlineService';

export type DeadlineWithCompany = Deadline & { companyName: string };

export const DATE_RANGE_OPTIONS = [7, 10, 15, 30] as const;

export type DateRangeOption = (typeof DATE_RANGE_OPTIONS)[number];

export type DashboardDomain = 'family_office' | 'cole_co';

export interface DashboardMetrics {
  pendingCount: number;
  completedCount: number;
  overdueCount: number;
  upcomingCount: number;
  urgentItems: DeadlineWithCompany[];
  hiddenCount: number;
  donutData: Array<{ name: string; value: number }>;
  barData: Array<{
    name: string;
    Pendiente: number;
    Vencido: number;
    Cumplido: number;
  }>;
}

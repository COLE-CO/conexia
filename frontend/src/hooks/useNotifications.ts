import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UserProfile } from '../services/authService';
import { getBalancesByCompany } from '../services/balanceService';
import type { Balance } from '../services/balanceService';
import { getDeadlinesByCompany } from '../services/deadlineService';
import type { Deadline } from '../services/deadlineService';
import { getStoredNotificationEvents } from '../services/notificationEventService';
import type { StoredNotificationEvent } from '../services/notificationEventService';

type NotificationType = 'deadline' | 'balance' | 'report';

interface DeadlineNotificationSource {
  companyId: number;
  companyName?: string;
  deadline: Deadline;
}

interface BalanceNotificationSource {
  companyId: number;
  companyName?: string;
  balance: Balance;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isoDate: string;
  type: NotificationType;
  companyId: number;
  companyName?: string;
  isRead: boolean;
}

interface UseNotificationsParams {
  user: UserProfile | null;
  companyIds: number[];
  companyNameById?: Record<number, string>;
}

const buildStorageKey = (userId: number) =>
  `conexia.notifications.read.${userId}`;

const getStoredReadIds = (userId: number): string[] => {
  const rawValue = localStorage.getItem(buildStorageKey(userId));

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed)
      ? parsed.filter((value) => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
};

const compareByDueDateAsc = (a: Deadline, b: Deadline) => {
  const aTime = new Date(a.due_date).getTime();
  const bTime = new Date(b.due_date).getTime();
  return aTime - bTime;
};

const compareByIsoDateDesc = (a: { isoDate: string }, b: { isoDate: string }) =>
  new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();

export const useNotifications = ({
  user,
  companyIds,
  companyNameById = {},
}: UseNotificationsParams) => {
  const [deadlineSources, setDeadlineSources] = useState<
    DeadlineNotificationSource[]
  >([]);
  const [balanceSources, setBalanceSources] = useState<
    BalanceNotificationSource[]
  >([]);
  const [reportEvents, setReportEvents] = useState<StoredNotificationEvent[]>(
    []
  );
  const [loading, setLoading] = useState(
    !!user?.alert_deadlines_enabled ||
      !!user?.alert_balances_enabled ||
      !!user?.alert_reports_enabled
  );
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [readIds, setReadIds] = useState<string[]>(() => {
    // Intentar cargar del localStorage al montar
    if (typeof window !== 'undefined' && user?.id) {
      return getStoredReadIds(user.id);
    }
    return [];
  });

  useEffect(() => {
    if (!user?.id) {
      setReadIds([]);
      return;
    }

    const storedIds = getStoredReadIds(user.id);
    setReadIds(storedIds);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    localStorage.setItem(buildStorageKey(user.id), JSON.stringify(readIds));
  }, [readIds, user?.id]);

  useEffect(() => {
    const shouldLoadDeadlines = !!user?.alert_deadlines_enabled;
    const shouldLoadBalances = !!user?.alert_balances_enabled;
    const shouldLoadReports = !!user?.alert_reports_enabled;
    const shouldLoadAnyAlerts =
      shouldLoadDeadlines || shouldLoadBalances || shouldLoadReports;

    if (!shouldLoadAnyAlerts) {
      setDeadlineSources([]);
      setBalanceSources([]);
      setReportEvents([]);
      setLoading(false);
      setError(null);
      return;
    }

    let ignore = false;

    const fetchNotificationsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const byCompany =
          companyIds.length > 0
            ? await Promise.all(
                companyIds.map(async (companyId) => {
                  const [deadlinesData, balancesData] = await Promise.all([
                    shouldLoadDeadlines
                      ? getDeadlinesByCompany(companyId)
                      : Promise.resolve([]),
                    shouldLoadBalances
                      ? getBalancesByCompany(companyId)
                      : Promise.resolve([]),
                  ]);

                  return {
                    companyId,
                    companyName: companyNameById[companyId],
                    deadlinesData,
                    balancesData,
                  };
                })
              )
            : [];

        const nextDeadlineSources = shouldLoadDeadlines
          ? byCompany
              .flatMap(({ companyId, companyName, deadlinesData }) =>
                deadlinesData
                  .filter((item) => item.status === 'pendiente')
                  .map((deadline) => ({ companyId, companyName, deadline }))
              )
              .sort((a, b) => compareByDueDateAsc(a.deadline, b.deadline))
          : [];

        const nextBalanceSources = shouldLoadBalances
          ? byCompany
              .flatMap(({ companyId, companyName, balancesData }) =>
                balancesData.map((balance) => ({
                  companyId,
                  companyName,
                  balance,
                }))
              )
              .sort((a, b) =>
                compareByIsoDateDesc(
                  { isoDate: a.balance.uploaded_at },
                  { isoDate: b.balance.uploaded_at }
                )
              )
          : [];

        const nextReportEvents =
          shouldLoadReports && user?.id
            ? getStoredNotificationEvents(user.id)
                .filter(
                  (event) =>
                    !event.companyId ||
                    companyIds.length === 0 ||
                    companyIds.includes(event.companyId)
                )
                .sort(compareByIsoDateDesc)
            : [];

        if (!ignore) {
          setDeadlineSources(nextDeadlineSources);
          setBalanceSources(nextBalanceSources);
          setReportEvents(nextReportEvents);
        }
      } catch {
        if (!ignore) {
          setDeadlineSources([]);
          setBalanceSources([]);
          setReportEvents([]);
          setError('No se pudieron cargar las notificaciones.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void fetchNotificationsData();

    return () => {
      ignore = true;
    };
  }, [
    companyIds,
    companyNameById,
    reloadKey,
    user?.alert_deadlines_enabled,
    user?.alert_balances_enabled,
    user?.alert_reports_enabled,
    user?.id,
  ]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const deadlineNotifications = deadlineSources.map(
      ({ companyId, companyName, deadline }) => {
        const id = `deadline-${companyId}-${deadline.id}`;

        const companyLabel = companyName ? `Empresa: ${companyName}. ` : '';

        return {
          id,
          title: `Vencimiento: ${deadline.name}`,
          message: `${companyLabel}${deadline.description || 'Revisa y gestiona este compromiso a tiempo.'}`,
          isoDate: deadline.due_date,
          type: 'deadline' as const,
          companyId,
          companyName,
          isRead: readIds.includes(id),
        };
      }
    );

    const balanceNotifications = balanceSources.map(
      ({ companyId, companyName, balance }) => ({
        id: `balance-${companyId}-${balance.id}`,
        title: `Balance cargado: ${balance.file_name}`,
        message: `${
          companyName ? `Empresa: ${companyName}. ` : ''
        }Se registró un balance para ${
          balance.month ? `${balance.month}/${balance.year}` : balance.year
        }.`,
        isoDate: balance.uploaded_at,
        type: 'balance' as const,
        companyId,
        companyName,
        isRead: readIds.includes(`balance-${companyId}-${balance.id}`),
      })
    );

    const reportNotifications = reportEvents.map((event) => ({
      id: event.id,
      title: event.title,
      message: event.message,
      isoDate: event.isoDate,
      type: 'report' as const,
      companyId: event.companyId ?? 0,
      companyName: event.companyName,
      isRead: readIds.includes(event.id),
    }));

    return [
      ...deadlineNotifications,
      ...balanceNotifications,
      ...reportNotifications,
    ].sort(compareByIsoDateDesc);
  }, [balanceSources, deadlineSources, readIds, reportEvents]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const markAsRead = useCallback((notificationId: string) => {
    setReadIds((currentIds) => {
      if (currentIds.includes(notificationId)) {
        return currentIds;
      }

      return [...currentIds, notificationId];
    });
  }, []);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  return {
    loading,
    error,
    notifications,
    unreadCount,
    markAsRead,
    retry,
  };
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UserProfile } from '../services/authService';
import { getDeadlinesByCompany } from '../services/deadlineService';
import type { Deadline } from '../services/deadlineService';

type NotificationType = 'deadline';

interface DeadlineNotificationSource {
  companyId: number;
  companyName?: string;
  deadline: Deadline;
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

export const useNotifications = ({
  user,
  companyIds,
  companyNameById = {},
}: UseNotificationsParams) => {
  const [sources, setSources] = useState<DeadlineNotificationSource[]>([]);
  const [loading, setLoading] = useState(!!user?.alert_deadlines_enabled);
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

    if (!shouldLoadDeadlines || companyIds.length === 0) {
      setSources([]);
      setLoading(false);
      setError(null);
      return;
    }

    let ignore = false;

    const fetchNotificationsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const byCompany = await Promise.all(
          companyIds.map(async (companyId) => {
            const deadlinesData = await getDeadlinesByCompany(companyId);
            return {
              companyId,
              companyName: companyNameById[companyId],
              deadlinesData,
            };
          })
        );

        const mergedSources = byCompany
          .flatMap(({ companyId, companyName, deadlinesData }) =>
            deadlinesData
              .filter((item) => item.status === 'pendiente')
              .map((deadline) => ({ companyId, companyName, deadline }))
          )
          .sort((a, b) => compareByDueDateAsc(a.deadline, b.deadline));

        if (!ignore) {
          setSources(mergedSources);
        }
      } catch {
        if (!ignore) {
          setSources([]);
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
  }, [companyIds, companyNameById, reloadKey, user?.alert_deadlines_enabled]);

  const notifications = useMemo<NotificationItem[]>(() => {
    return sources.map(({ companyId, companyName, deadline }) => {
      const id = `deadline-${companyId}-${deadline.id}`;

      const companyLabel = companyName ? `Empresa: ${companyName}. ` : '';

      return {
        id,
        title: `Vencimiento: ${deadline.name}`,
        message: `${companyLabel}${deadline.description || 'Revisa y gestiona este compromiso a tiempo.'}`,
        isoDate: deadline.due_date,
        type: 'deadline',
        companyId,
        companyName,
        isRead: readIds.includes(id),
      };
    });
  }, [readIds, sources]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const markAsRead = useCallback(
    (notificationId: string) => {
      setReadIds((currentIds) => {
        if (currentIds.includes(notificationId)) {
          return currentIds;
        }

        const nextReadIds = [...currentIds, notificationId];

        if (user?.id) {
          localStorage.setItem(
            buildStorageKey(user.id),
            JSON.stringify(nextReadIds)
          );
        }

        return nextReadIds;
      });
    },
    [user?.id]
  );

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

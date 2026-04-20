export type StoredNotificationEventType = 'report';

export interface StoredNotificationEvent {
  id: string;
  type: StoredNotificationEventType;
  title: string;
  message: string;
  isoDate: string;
  companyId?: number;
  companyName?: string;
}

const buildStorageKey = (userId: number) =>
  `conexia.notifications.events.${userId}`;

const parseStoredEvents = (rawValue: string | null): StoredNotificationEvent[] => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed)
      ? parsed.filter(
          (value): value is StoredNotificationEvent =>
            typeof value?.id === 'string' &&
            typeof value?.type === 'string' &&
            typeof value?.title === 'string' &&
            typeof value?.message === 'string' &&
            typeof value?.isoDate === 'string'
        )
      : [];
  } catch {
    return [];
  }
};

export const getStoredNotificationEvents = (
  userId: number
): StoredNotificationEvent[] => {
  return parseStoredEvents(localStorage.getItem(buildStorageKey(userId)));
};

export const appendStoredNotificationEvent = (
  userId: number,
  event: StoredNotificationEvent
) => {
  const currentEvents = getStoredNotificationEvents(userId);
  const nextEvents = [event, ...currentEvents.filter((item) => item.id !== event.id)];
  localStorage.setItem(buildStorageKey(userId), JSON.stringify(nextEvents.slice(0, 50)));
};

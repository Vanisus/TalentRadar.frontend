// src/shared/notificationsApi.ts
// Единый react-query хук уведомлений для candidate и hr
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useCurrentUser } from './auth';

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

function notificationsEndpoint(role: string | undefined) {
  if (role === 'hr') return '/hr/notifications';
  if (role === 'candidate') return '/candidates/notifications';
  // Для admin пока отдельного эндпоинта нет — не ходим никуда
  return null;
}

export function useNotifications() {
  const { data: user } = useCurrentUser();
  const endpoint = notificationsEndpoint(user?.role);

  return useQuery<Notification[]>({
    queryKey: ['notifications', user?.role],
    queryFn: () => apiFetch<Notification[]>(endpoint as string),
    enabled: !!user && !!endpoint,
    refetchInterval: 30_000, // polling каждые 30 сек
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();
  const role = user?.role;

  return useMutation<void, Error, number>({
    mutationFn: (id: number) => {
      if (role === 'hr') {
        return apiFetch<void>(`/hr/notifications/${id}/read`, { method: 'PATCH' });
      }
      if (role === 'candidate') {
        return apiFetch<void>(`/candidates/notifications/${id}/read`, { method: 'PATCH' });
      }
      // admin или неизвестная роль — ничего не делаем
      return Promise.resolve();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', role] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();
  const role = user?.role;

  return useMutation<void, Error, Notification[]>({
    mutationFn: async (notifications: Notification[]) => {
      if (role !== 'hr' && role !== 'candidate') {
        // admin — пропускаем
        return;
      }
      const base = role === 'hr' ? '/hr' : '/candidates';
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(
        unread.map((n) =>
          apiFetch<void>(`${base}/notifications/${n.id}/read`, { method: 'PATCH' }),
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', role] });
    },
  });
}

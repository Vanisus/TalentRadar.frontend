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
  if (role === 'hr' || role === 'admin') return '/hr/notifications';
  return '/candidates/notifications';
}

export function useNotifications() {
  const { data: user } = useCurrentUser();
  const endpoint = notificationsEndpoint(user?.role);

  return useQuery<Notification[]>({
    queryKey: ['notifications', user?.role],
    queryFn: () => apiFetch<Notification[]>(endpoint),
    enabled: !!user,
    refetchInterval: 30_000, // polling каждые 30 сек
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();
  const role = user?.role;

  return useMutation<void, Error, number>({
    mutationFn: (id: number) => {
      const base = role === 'hr' || role === 'admin' ? '/hr' : '/candidates';
      return apiFetch<void>(`${base}/notifications/${id}/read`, { method: 'PATCH' });
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
      const base = role === 'hr' || role === 'admin' ? '/hr' : '/candidates';
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

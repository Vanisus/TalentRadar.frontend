// src/features/hr/notifications/hrNotificationsApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api';
import { type HRNotification } from '../types';

export function useHRNotifications() {
  return useQuery<HRNotification[]>({
    queryKey: ['hr', 'notifications'],
    queryFn: () => apiFetch<HRNotification[]>('/hr/notifications'),
  });
}

export function useMarkHRNotificationAsRead() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/hr/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'notifications'] });
    },
  });
}

// src/features/admin/adminApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../shared/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = 'candidate' | 'hr' | 'admin';

export interface AdminUser {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  role: UserRole;
  is_blocked: boolean;
}

export interface AdminStats {
  users: {
    total: number;
    candidates: number;
    hr_managers: number;
    admins: number;
    blocked: number;
  };
  vacancies: {
    total: number;
    active: number;
  };
  applications: {
    total: number;
  };
}

export interface AdminLogs {
  total_lines: number;
  returned_lines: number;
  logs: string[];
}

export interface SuspiciousUser {
  email: string;
  failed_attempts: number;
  is_locked: boolean;
  ttl_seconds: number;
}

export interface SuspiciousActivity {
  total: number;
  users: SuspiciousUser[];
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiFetch<AdminStats>('/admin/stats'),
    refetchInterval: 60_000,
  });
}

export function useAdminUsers(filters: { role?: UserRole; is_blocked?: boolean } = {}) {
  const params = new URLSearchParams();
  if (filters.role) params.set('role', filters.role);
  if (filters.is_blocked !== undefined) params.set('is_blocked', String(filters.is_blocked));
  const qs = params.toString();

  return useQuery<AdminUser[]>({
    queryKey: ['admin', 'users', filters],
    queryFn: () => apiFetch<AdminUser[]>(`/admin/users${qs ? '?' + qs : ''}`),
  });
}

export function useAdminLogs(lines: number = 100) {
  return useQuery<AdminLogs>({
    queryKey: ['admin', 'logs', lines],
    queryFn: () => apiFetch<AdminLogs>(`/admin/logs?lines=${lines}`),
    refetchInterval: 30_000,
  });
}

export function useAdminSuspicious(minAttempts: number = 3) {
  return useQuery<SuspiciousActivity>({
    queryKey: ['admin', 'suspicious', minAttempts],
    queryFn: () => apiFetch<SuspiciousActivity>(`/admin/suspicious?min_attempts=${minAttempts}`),
    refetchInterval: 30_000,
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => apiFetch<{ message: string }>(`/admin/users/${id}/block`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => apiFetch<{ message: string }>(`/admin/users/${id}/unblock`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

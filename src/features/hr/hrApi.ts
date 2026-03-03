import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../shared/api';

// ─── Интерфейсы ───────────────────────────────────────────────────────────────

export interface HRVacancy {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HRVacancyCreate {
  title: string;
  description: string;
  required_skills: string[];
  is_active?: boolean;
}

export type ApplicationStatus = 'new' | 'under_review' | 'accepted' | 'rejected';

export interface HRApplication {
  id: number;
  vacancy_id: number;
  candidate_id: number;
  status: ApplicationStatus;
  match_score: number;
  created_at: string;
  updated_at: string;
  rating?: number | null;
  pipeline_stage?: string | null;
  match_summary?: string | null;
}

export interface HRCandidate {
  id: number;
  email: string;
  full_name?: string | null;
  city?: string | null;
  desired_position?: string | null;
  desired_salary?: number | null;
  phone?: string | null;
}

export interface HRDashboardStats {
  total_vacancies: number;
  active_vacancies: number;
  total_applications: number;
  new_applications: number;
  accepted_applications: number;
  rejected_applications: number;
}

export interface HRNotification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Вакансии ─────────────────────────────────────────────────────────────────

export function useHRVacancies() {
  return useQuery<HRVacancy[]>({
    queryKey: ['hr', 'vacancies'],
    queryFn: () => apiFetch<HRVacancy[]>('/hr/vacancies'),
  });
}

export function useCreateVacancy() {
  const qc = useQueryClient();
  return useMutation<HRVacancy, Error, HRVacancyCreate>({
    mutationFn: (payload) =>
      apiFetch<HRVacancy>('/hr/vacancies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'vacancies'] });
    },
  });
}

export function useUpdateVacancy() {
  const qc = useQueryClient();
  return useMutation<HRVacancy, Error, { id: number } & Partial<HRVacancyCreate>>({
    mutationFn: ({ id, ...payload }) =>
      apiFetch<HRVacancy>(`/hr/vacancies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'vacancies'] });
    },
  });
}

export function useDeleteVacancy() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/hr/vacancies/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'vacancies'] });
    },
  });
}

// ─── Кандидаты ────────────────────────────────────────────────────────────────

export function useHRCandidates() {
  return useQuery<HRCandidate[]>({
    queryKey: ['hr', 'candidates'],
    queryFn: () => apiFetch<HRCandidate[]>('/hr/candidates'),
  });
}

// ─── Отклики ──────────────────────────────────────────────────────────────────

export function useHRApplications() {
  return useQuery<HRApplication[]>({
    queryKey: ['hr', 'applications'],
    queryFn: () => apiFetch<HRApplication[]>('/hr/applications'),
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation<HRApplication, Error, { id: number; status: ApplicationStatus }>({
    mutationFn: ({ id, status }) =>
      apiFetch<HRApplication>(`/hr/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'applications'] });
    },
  });
}

// ─── Аналитика ────────────────────────────────────────────────────────────────

export function useHRDashboardStats() {
  return useQuery<HRDashboardStats>({
    queryKey: ['hr', 'dashboard'],
    queryFn: () => apiFetch<HRDashboardStats>('/hr/dashboard'),
  });
}

// ─── Уведомления ─────────────────────────────────────────────────────────────

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

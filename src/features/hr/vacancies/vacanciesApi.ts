// src/features/hr/vacancies/vacanciesApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getAuthToken } from '@/shared/api';
import {
  type HRVacancy,
  type HRVacancyCreate,
  type HRApplication,
  type VacancyApplicationsAnalysis,
} from '../types';

// ─── Вакансии ────────────────────────────────────────────────────────────────

export function useHRVacancies() {
  return useQuery<HRVacancy[]>({
    queryKey: ['hr', 'vacancies'],
    enabled: !!getAuthToken(),
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

// ─── Отклики по вакансии ─────────────────────────────────────────────────────

export function useVacancyApplications(
  vacancyId: number | null,
  minScore: number = 0,
) {
  return useQuery<HRApplication[]>({
    queryKey: ['hr', 'vacancyApplications', vacancyId, minScore],
    enabled: vacancyId != null && !!getAuthToken(),
    queryFn: async () => {
      const data = await apiFetch<any>(
        `/hr/vacancies/${vacancyId}/applications?min_score=${minScore}`,
      );
      return Array.isArray(data) ? data : (data ?? []);
    },
  });
}

export function useVacancyApplicationsAnalysis(vacancyId: number | null) {
  return useQuery<VacancyApplicationsAnalysis>({
    queryKey: ['hr', 'vacancyApplicationsAnalysis', vacancyId],
    enabled: vacancyId != null && !!getAuthToken(),
    queryFn: () =>
      apiFetch<VacancyApplicationsAnalysis>(
        `/hr/vacancies/${vacancyId}/applications/analysis`,
      ),
  });
}

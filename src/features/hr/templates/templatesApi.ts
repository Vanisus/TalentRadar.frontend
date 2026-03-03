// src/features/hr/templates/templatesApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api';
import {
  type HRVacancy,
  type HRVacancyTemplate,
  type HRVacancyTemplateCreate,
  type HRVacancyTemplateUpdate,
  type HRVacancyFromTemplatePayload,
} from '../types';

// ─── Шаблоны ─────────────────────────────────────────────────────────────────

export function useHRTemplates() {
  return useQuery<HRVacancyTemplate[]>({
    queryKey: ['hr', 'templates'],
    queryFn: () => apiFetch<HRVacancyTemplate[]>('/hr/templates'),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation<HRVacancyTemplate, Error, HRVacancyTemplateCreate>({
    mutationFn: (payload) =>
      apiFetch<HRVacancyTemplate>('/hr/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation<
    HRVacancyTemplate,
    Error,
    { id: number } & HRVacancyTemplateUpdate
  >({
    mutationFn: ({ id, ...payload }) =>
      apiFetch<HRVacancyTemplate>(`/hr/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'templates'] });
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/hr/templates/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'templates'] });
    },
  });
}

export function useCreateVacancyFromTemplate() {
  const qc = useQueryClient();
  return useMutation<
    HRVacancy,
    Error,
    { templateId: number; data: HRVacancyFromTemplatePayload }
  >({
    mutationFn: ({ templateId, data }) =>
      apiFetch<HRVacancy>(
        `/hr/templates/${templateId}/create-vacancy`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'vacancies'] });
    },
  });
}

// src/features/hr/applications/applicationsApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api';
import {
  type HRApplication,
  type ApplicationStatus,
  type HRApplicationUpdatePayload,
} from '../types';

// ─ Общий список откликов ───────────────────────────────────────────────

export function useHRApplications() {
  return useQuery<HRApplication[]>({
    queryKey: ['hr', 'applications'],
    queryFn: () => apiFetch<HRApplication[]>('/hr/applications'),
  });
}

// ─ Статус отклика ────────────────────────────────────────────────────

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation<HRApplication, Error, { id: number; status: ApplicationStatus }>({
    mutationFn: ({ id, status }) =>
      apiFetch<HRApplication>(`/hr/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'applications'] });
      qc.invalidateQueries({ queryKey: ['hr', 'vacancies'] });
    },
  });
}

// ─ HR-обновление (rating, stage, summary) ─────────────────────────────────

export function useUpdateApplicationHR() {
  const qc = useQueryClient();
  return useMutation<
    HRApplication,
    Error,
    { id: number; data: HRApplicationUpdatePayload }
  >({
    mutationFn: ({ id, data }) =>
      apiFetch<HRApplication>(`/hr/candidates/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hr', 'applications'] });
      qc.invalidateQueries({ queryKey: ['hr', 'vacancies'] });
    },
  });
}

// ─ LLM-анализ отклика ─────────────────────────────────────────────────

export interface LLMAnalyzeResult {
  application_id: number;
  match_score: number;
  llm_summary: string;
}

export function useLLMAnalyzeApplication() {
  const qc = useQueryClient();
  return useMutation<LLMAnalyzeResult, Error, { id: number }>({
    mutationFn: ({ id }) =>
      apiFetch<LLMAnalyzeResult>(`/hr/applications/${id}/llm-analyze`, {
        method: 'POST',
      }),
    onSuccess: () => {
      // Обновляем все списки откликов, чтобы match_summary появился
      qc.invalidateQueries({ queryKey: ['hr', 'applications'] });
      qc.invalidateQueries({ queryKey: ['hr', 'vacancies'] });
    },
  });
}

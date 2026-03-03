import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_BASE } from '../../shared/api';

export interface VacancyRead {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hr_id: number;
}

export function useCandidateVacancies() {
  return useQuery<VacancyRead[]>({
    queryKey: ['candidate', 'vacancies'],
    queryFn: () => apiFetch<VacancyRead[]>('/candidates/vacancies'),
  });
}

export type ApplicationStatus = 'new' | 'under_review' | 'rejected' | 'accepted';

export interface ApplicationRead {
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

export function useCandidateApplications() {
  return useQuery<ApplicationRead[]>({
    queryKey: ['candidate', 'applications'],
    queryFn: () => apiFetch<ApplicationRead[]>('/candidates/applications'),
  });
}

export interface RecommendedVacancy extends VacancyRead {
  match_score: number;
}

export function useRecommendedVacancies(minScore: number = 0) {
  return useQuery<RecommendedVacancy[]>({
    queryKey: ['candidate', 'vacancies', 'recommended', minScore],
    queryFn: async () => {
      try {
        return await apiFetch<RecommendedVacancy[]>(
          `/candidates/vacancies/recommended?min_score=${minScore}`,
        );
      } catch (e: any) {
        // apiFetch сейчас кидает Error('HTTP 400') — можно его доработать,
        // но пока проще сделать спец-обработку по тексту
        if (e instanceof Error && e.message.startsWith('HTTP 400')) {
          // считаем, что рекомендаций нет (например, нет резюме)
          return [];
        }
        throw e;
      }
    },
  });
}

export interface CreateApplicationPayload {
  vacancy_id: number;
}

export function useApplyToVacancy() {
  const qc = useQueryClient();

  return useMutation<ApplicationRead, Error, CreateApplicationPayload>({
    mutationFn: (payload) =>
      apiFetch<ApplicationRead>('/candidates/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'applications'] });
    },
  });
}

export function useCandidateVacancy(id: number) {
  return useQuery<VacancyRead>({
    queryKey: ['candidate', 'vacancies', id],
    queryFn: () => apiFetch<VacancyRead>(`/candidates/vacancies/${id}`),
  });
}






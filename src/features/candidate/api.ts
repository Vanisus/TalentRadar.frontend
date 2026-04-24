import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../shared/api';

// Все вакансии теперь возвращают match_score (быстрый, без LLM)
export interface VacancyWithMatchScore {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hr_id: number;
  match_score: number;
}

/** @deprecated use VacancyWithMatchScore */
export type VacancyRead = VacancyWithMatchScore;

export function useCandidateVacancies() {
  return useQuery<VacancyWithMatchScore[]>({
    queryKey: ['candidate', 'vacancies'],
    queryFn: () => apiFetch<VacancyWithMatchScore[]>('/candidates/vacancies'),
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

/** Рекомендованные — это те же вакансии, но отфильтрованные по score. */
export type RecommendedVacancy = VacancyWithMatchScore;

export function useRecommendedVacancies(minScore: number = 50) {
  return useQuery<RecommendedVacancy[]>({
    queryKey: ['candidate', 'vacancies', 'recommended', minScore],
    queryFn: async () => {
      try {
        return await apiFetch<RecommendedVacancy[]>(
          `/candidates/vacancies/recommended?min_score=${minScore}`,
        );
      } catch (e: any) {
        if (e instanceof Error && e.message.startsWith('HTTP 400')) {
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
  return useQuery<VacancyWithMatchScore>({
    queryKey: ['candidate', 'vacancies', id],
    queryFn: () => apiFetch<VacancyWithMatchScore>(`/candidates/vacancies/${id}`),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getAuthToken } from '../../shared/api';

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
    enabled: !!getAuthToken(),
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
    enabled: !!getAuthToken(),
    queryFn: () => apiFetch<ApplicationRead[]>('/candidates/applications'),
  });
}

export type RecommendedVacancy = VacancyWithMatchScore;

export function useRecommendedVacancies(minScore: number = 50) {
  return useQuery<RecommendedVacancy[]>({
    queryKey: ['candidate', 'vacancies', 'recommended', minScore],
    enabled: !!getAuthToken(),
    queryFn: async () => {
      try {
        return await apiFetch<RecommendedVacancy[]>(
          `/candidates/vacancies/recommended?min_score=${minScore}`,
        );
      } catch (e: any) {
        if (e instanceof Error && e.message.startsWith('HTTP 400')) return [];
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

    // Оптимистичное обновление: сразу добавляем запись в кеш без ожидания сервера
    onMutate: async (payload) => {
      // Отменяем фоновый refetch, чтобы он не перетёр оптимистику
      await qc.cancelQueries({ queryKey: ['candidate', 'applications'] });

      // Сохраняем снапшот для роллбэка
      const previous = qc.getQueryData<ApplicationRead[]>(['candidate', 'applications']);

      // Оптимистично добавляем временную запись
      const optimistic: ApplicationRead = {
        id: -1, // временный id, заменится после onSuccess
        vacancy_id: payload.vacancy_id,
        candidate_id: 0,
        status: 'new',
        match_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rating: null,
        pipeline_stage: null,
        match_summary: null,
      };

      qc.setQueryData<ApplicationRead[]>(
        ['candidate', 'applications'],
        (old) => [...(old ?? []), optimistic],
      );

      return { previous };
    },

    onSuccess: (data) => {
      // Заменяем временную запись (-1) на реальную с сервера
      qc.setQueryData<ApplicationRead[]>(
        ['candidate', 'applications'],
        (old) => (old ?? []).map((a) => (a.id === -1 ? data : a)),
      );
      // Сбрасываем вакансии только один раз
      qc.invalidateQueries({ queryKey: ['candidate', 'vacancies'] });
    },

    onError: (_err, _vars, context) => {
      // Откатываем оптимистичное изменение
      if (context?.previous !== undefined) {
        qc.setQueryData(['candidate', 'applications'], context.previous);
      }
    },
  });
}

export function useCandidateVacancy(id: number) {
  return useQuery<VacancyWithMatchScore>({
    queryKey: ['candidate', 'vacancies', id],
    enabled: !!getAuthToken(),
    queryFn: () => apiFetch<VacancyWithMatchScore>(`/candidates/vacancies/${id}`),
  });
}

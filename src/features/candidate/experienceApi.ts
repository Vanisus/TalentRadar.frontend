import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../shared/api';

export interface WorkExperience {
  id: number;
  company: string;
  position: string;
  description?: string | null;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null;
  is_current: boolean;
}

export interface WorkExperienceCreate {
  company: string;
  position: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
}

export function useExperiences() {
  return useQuery<WorkExperience[]>({
    queryKey: ['candidate', 'experiences'],
    queryFn: () => apiFetch<WorkExperience[]>('/candidates/profile/experiences'),
  });
}

export function useAddExperience() {
  const qc = useQueryClient();
  return useMutation<WorkExperience, Error, WorkExperienceCreate>({
    mutationFn: (payload) =>
      apiFetch<WorkExperience>('/candidates/profile/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'experiences'] });
    },
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/candidates/profile/experiences/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'experiences'] });
    },
  });
}

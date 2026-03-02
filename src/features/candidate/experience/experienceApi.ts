import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../shared/api';

export interface WorkExperienceRead {
  id: number;
  company: string;
  position: string;
  description: string | null;
  start_date: string;  // формат date
  end_date: string | null;
  is_current: boolean;
}

export interface WorkExperienceCreate {
  company: string;
  position: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
}

export function useExperiences() {
  return useQuery<WorkExperienceRead[]>({
    queryKey: ['candidate', 'profile', 'experiences'],
    queryFn: () =>
      apiFetch<WorkExperienceRead[]>('/candidates/profile/experiences'),
  });
}

export function useAddExperience() {
  const qc = useQueryClient();
  return useMutation<void, Error, WorkExperienceCreate>({
    mutationFn: (payload) =>
      apiFetch<void>('/candidates/profile/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
      qc.invalidateQueries({ queryKey: ['candidate', 'profile', 'experiences'] });
    },
  });
}

export function useUpdateExperience() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: number } & WorkExperienceCreate>({
    mutationFn: ({ id, ...payload }) =>
      apiFetch<void>(`/candidates/profile/experiences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
      qc.invalidateQueries({ queryKey: ['candidate', 'profile', 'experiences'] });
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
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
      qc.invalidateQueries({ queryKey: ['candidate', 'profile', 'experiences'] });
    },
  });
}


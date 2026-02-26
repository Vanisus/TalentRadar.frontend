import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../shared/api';

export interface Education {
  id: number;
  institution: string;
  degree: string;
  field_of_study?: string | null;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null;
  is_current: boolean;
}

export interface EducationCreate {
  institution: string;
  degree: string;
  field_of_study?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
}

export function useEducations() {
  return useQuery<Education[]>({
    queryKey: ['candidate', 'educations'],
    queryFn: () => apiFetch<Education[]>('/candidates/profile/educations'),
  });
}

export function useAddEducation() {
  const qc = useQueryClient();
  return useMutation<Education, Error, EducationCreate>({
    mutationFn: (payload) =>
      apiFetch<Education>('/candidates/profile/educations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'educations'] });
    },
  });
}

export function useDeleteEducation() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/candidates/profile/educations/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'educations'] });
    },
  });
}

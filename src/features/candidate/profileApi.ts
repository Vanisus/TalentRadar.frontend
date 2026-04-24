// src/features/candidate/profileApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getAuthToken } from '../../shared/api';

export interface CandidateProfileRead {
  id: number;
  user_id: number;
  about_me?: string | null;
  desired_position?: string | null;
  desired_salary?: number | null;
  city?: string | null;
  phone?: string | null;
  telegram?: string | null;
  birth_date?: string | null; // ISO
  created_at: string;
  updated_at: string;
}

export interface CandidateProfileUpdate {
  about_me?: string | null;
  desired_position?: string | null;
  desired_salary?: number | null;
  city?: string | null;
  phone?: string | null;
  telegram?: string | null;
  birth_date?: string | null;
}

export function useCandidateProfile() {
  return useQuery<CandidateProfileRead>({
    queryKey: ['candidate', 'profile'],
    enabled: !!getAuthToken(),
    queryFn: () => apiFetch<CandidateProfileRead>('/candidates/profile'),
  });
}

export function useUpdateCandidateProfile() {
  const qc = useQueryClient();

  return useMutation<CandidateProfileRead, Error, CandidateProfileUpdate>({
    mutationFn: (payload) =>
      apiFetch<CandidateProfileRead>('/candidates/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      qc.setQueryData(['candidate', 'profile'], data);
    },
  });
}

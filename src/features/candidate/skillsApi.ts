import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../shared/api';

export interface CandidateSkill {
  id: number;
  name: string;
  level?: string | null; // если в схеме есть уровень, иначе можно убрать
}

export interface CandidateSkillCreate {
  name: string;
  level?: string | null;
}

export function useSkills() {
  return useQuery<CandidateSkill[]>({
    queryKey: ['candidate', 'skills'],
    queryFn: () => apiFetch<CandidateSkill[]>('/candidates/profile/skills'),
  });
}

export function useAddSkill() {
  const qc = useQueryClient();
  return useMutation<CandidateSkill, Error, CandidateSkillCreate>({
    mutationFn: (payload) =>
      apiFetch<CandidateSkill>('/candidates/profile/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'skills'] });
    },
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/candidates/profile/skills/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'skills'] });
    },
  });
}

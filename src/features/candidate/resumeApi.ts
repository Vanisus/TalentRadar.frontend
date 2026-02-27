import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_BASE, getAuthToken } from '../../shared/api';

export interface ResumeRecommendation {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export function useResumeRecommendations() {
  return useQuery<ResumeRecommendation[]>({
    queryKey: ['candidate', 'resume', 'recommendations'],
    queryFn: () =>
      apiFetch<ResumeRecommendation[]>('/candidates/resume/recommendations'),
  });
}

export function useUploadResume() {
  const qc = useQueryClient();

  return useMutation<void, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file); // поле file по схеме uploadresumecandidatesresumepost[file:2]

      const token = getAuthToken(); // читает localStorage.getItem('token')

      if (!token) {
        throw new Error('Нет токена авторизации');
      }

      const resp = await fetch(`${API_BASE}/candidates/resume`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resp.ok) {
        let msg = 'Ошибка загрузки резюме';
        try {
          const data = await resp.json();
          if (typeof (data as any)?.detail === 'string') {
            msg = (data as any).detail;
          }
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'resume', 'recommendations'] });
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_BASE, getAuthToken } from '../../shared/api';

export interface ResumeRecommendationsResponse {
  recommendations: string[];
}

export function useResumeRecommendations() {
  return useQuery<string[]>({
    queryKey: ['candidate', 'resume', 'recommendations'],
    queryFn: async () => {
      const result = await apiFetch<ResumeRecommendationsResponse>(
        '/candidates/resume/recommendations',
      );
      return result?.recommendations ?? [];
    },
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

export interface ResumeStatus {
  has_resume_file: boolean;
  resume_file_path?: string | null;
}

export function useResumeStatus() {
  return useQuery<ResumeStatus>({
    queryKey: ['candidate', 'resume', 'status'],
    queryFn: () => apiFetch<ResumeStatus>('/candidates/profile/resume/status'),
  });
}


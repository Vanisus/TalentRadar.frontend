import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_BASE, getAuthToken } from '@/shared/api';

export interface Certificate {
  id: number;
  title: string;
  issuer?: string | null;
  issue_date?: string | null;  // YYYY-MM-DD
  file_path?: string | null;
  preview_path?: string | null;
}

export function useCertificates() {
  return useQuery<Certificate[]>({
    queryKey: ['candidate', 'certificates'],
    queryFn: () => apiFetch<Certificate[]>('/candidates/profile/certificates'),
  });
}

export function useUploadCertificate() {
  const qc = useQueryClient();

  return useMutation<Certificate, Error, { file: File; title?: string }>({
    mutationFn: async ({ file, title }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);

      const token = getAuthToken(); // читает localStorage.getItem('token')

      if (!token) {
        throw new Error('Нет токена авторизации');
      }

      const resp = await fetch(`${API_BASE}/candidates/profile/certificates/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`, // добавляем токен
          // Content-Type НЕ ставим — браузер сам проставит boundary для multipart
        },
      });

      if (!resp.ok) {
        let msg = 'Ошибка загрузки сертификата';
        try {
          const data = await resp.json();
          if (typeof data?.detail === 'string') msg = data.detail;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      return (await resp.json()) as Certificate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'certificates'] });
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
    },
  });
}

export function useDeleteCertificate() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/candidates/profile/certificates/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'certificates'] });
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
    },
  });
}

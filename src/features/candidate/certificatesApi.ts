import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_BASE } from '../../shared/api';

export interface Certificate {
  id: number;
  title: string;
  issuer?: string | null;
  issue_date?: string | null; // YYYY-MM-DD
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

      const resp = await fetch(`${API_BASE}/candidates/profile/certificates/upload`, {
        method: 'POST',
        body: formData,
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

import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_BASE, getAuthToken } from '../../shared/api';

export interface ResumeRecommendationsResponse {
  recommendations: string[];
}

export function useResumeRecommendations() {
  return useQuery<string[]>({
    queryKey: ['candidate', 'resume', 'recommendations'],
    enabled: !!getAuthToken(),
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
      formData.append('file', file);

      const token = getAuthToken();
      if (!token) throw new Error('Нет токена авторизации');

      const resp = await fetch(`${API_BASE}/candidates/resume`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        let msg = 'Ошибка загрузки резюме';
        try {
          const data = await resp.json();
          if (typeof (data as any)?.detail === 'string') msg = (data as any).detail;
        } catch { /* ignore */ }
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      // Сбрасываем кеш, чтобы статус парсинга начал polling
      qc.invalidateQueries({ queryKey: ['candidate', 'resume', 'parseStatus'] });
      qc.invalidateQueries({ queryKey: ['candidate', 'resume', 'status'] });
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
    enabled: !!getAuthToken(),
    queryFn: () => apiFetch<ResumeStatus>('/candidates/profile/resume/status'),
  });
}

export type ParseStatus = 'pending' | 'success' | 'failed';

export interface ParsedResumeStatus {
  parse_status: ParseStatus;
  error_message?: string | null;
}

/**
 * Хук для отслеживания статуса LLM-парсинга резюме.
 * Автоматически делает polling каждые 3 сек пока статус === 'pending'.
 * Когда переходит в success — инвалидирует профиль и рекомендации.
 */
export function useResumeParseStatus() {
  const qc = useQueryClient();
  const wasSuccessRef = useRef(false);

  const query = useQuery<ParsedResumeStatus | null>({
    queryKey: ['candidate', 'resume', 'parseStatus'],
    enabled: !!getAuthToken(),
    refetchInterval: (query) => {
      const data = query.state.data;
      // Если null (нет резюме) — не поллим
      if (!data) return false;
      // Если pending — поллим каждые 3 сек
      if (data.parse_status === 'pending') return 3000;
      // Иначе остановить
      return false;
    },
    queryFn: async () => {
      try {
        return await apiFetch<ParsedResumeStatus>('/candidates/resume/parsed');
      } catch {
        // 404 — резюме ещё не загружалось
        return null;
      }
    },
  });

  // Когда статус меняется на success — инвалидируем профиль
  useEffect(() => {
    if (query.data?.parse_status === 'success' && !wasSuccessRef.current) {
      wasSuccessRef.current = true;
      qc.invalidateQueries({ queryKey: ['candidate', 'profile'] });
      qc.invalidateQueries({ queryKey: ['candidate', 'resume', 'recommendations'] });
      qc.invalidateQueries({ queryKey: ['candidate', 'resume', 'status'] });
    }
    if (query.data?.parse_status === 'pending') {
      wasSuccessRef.current = false;
    }
  }, [query.data?.parse_status, qc]);

  return query;
}

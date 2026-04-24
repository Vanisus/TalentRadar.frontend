import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getAuthToken } from '../../../shared/api';

export interface PortfolioItem {
  id: number;
  title: string;
  description?: string | null;
  url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItemCreate {
  title: string;
  description?: string | null;
  url?: string | null;
}

export function usePortfolioItems() {
  return useQuery<PortfolioItem[]>({
    queryKey: ['candidate', 'portfolio'],
    enabled: !!getAuthToken(),
    queryFn: () => apiFetch<PortfolioItem[]>('/candidates/profile/portfolio'),
  });
}

export function useAddPortfolioItem() {
  const qc = useQueryClient();
  return useMutation<PortfolioItem, Error, PortfolioItemCreate>({
    mutationFn: (payload) =>
      apiFetch<PortfolioItem>('/candidates/profile/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'portfolio'] });
    },
  });
}

export function useDeletePortfolioItem() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/candidates/profile/portfolio/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'portfolio'] });
    },
  });
}

export function useUpdatePortfolioItem() {
  const qc = useQueryClient();
  return useMutation<PortfolioItem, Error, { id: number } & PortfolioItemCreate>({
    mutationFn: ({ id, ...payload }) =>
      apiFetch<PortfolioItem>(`/candidates/profile/portfolio/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'portfolio'] });
    },
  });
}

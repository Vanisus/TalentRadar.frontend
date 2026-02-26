import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../shared/api';

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
    queryFn: () => apiFetch<PortfolioItem[]>('/candidates/profile/portfolio_items'),
  });
}

export function useAddPortfolioItem() {
  const qc = useQueryClient();
  return useMutation<PortfolioItem, Error, PortfolioItemCreate>({
    mutationFn: (payload) =>
      apiFetch<PortfolioItem>('/candidates/profile/portfolio_items', {
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
      apiFetch<void>(`/candidates/profile/portfolio_items/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate', 'portfolio'] });
    },
  });
}

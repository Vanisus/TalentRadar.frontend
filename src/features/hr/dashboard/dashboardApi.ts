import { useQuery } from '@tanstack/react-query';
import { apiFetch, getAuthToken } from '@/shared/api';
import { type HRDashboardView } from '../types';

export function useHRDashboardView(daysNew: number = 1, daysStale: number = 7) {
  return useQuery<HRDashboardView>({
    queryKey: ['hr', 'dashboard', daysNew, daysStale],
    enabled: !!getAuthToken(),
    queryFn: () =>
      apiFetch<HRDashboardView>(
        `/hr/dashboard?days_new=${daysNew}&days_stale=${daysStale}`,
      ),
  });
}

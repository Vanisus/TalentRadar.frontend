// src/shared/auth.ts
import { useQuery } from '@tanstack/react-query';
import { apiFetch, setAuthToken, getAuthToken } from './api';

export type UserRole = 'admin' | 'hr' | 'candidate';

export interface UserRead {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  role: UserRole;
  is_blocked: boolean;
  full_name?: string | null;
}

export function useCurrentUser() {
  return useQuery<UserRead | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return null;
      try {
        const user = await apiFetch<UserRead>('/users/me');
        return user;
      } catch {
        setAuthToken(null);
        return null;
      }
    },
  });
}

export function logoutClientOnly() {
  setAuthToken(null);
}

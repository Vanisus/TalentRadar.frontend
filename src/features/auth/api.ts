import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE, apiFetch, setAuthToken } from '../../shared/api';
import type { UserRead } from '../../shared/auth';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export function useLoginMutation() {
  const qc = useQueryClient();

  return useMutation<UserRead, Error, { email: string; password: string }>({
    mutationFn: async ({ email, password }) => {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password }),
      });

      if (!resp.ok) {
        let msg = 'Ошибка авторизации';
        try {
          const data = await resp.json();
          if (typeof data?.detail === 'string') msg = data.detail;
        } catch {}
        throw new Error(msg);
      }

      const data = (await resp.json()) as LoginResponse;
      setAuthToken(data.access_token);

      const user = await apiFetch<UserRead>('/users/me');
      return user;
    },
    onSuccess: (user) => {
      qc.setQueryData(['currentUser'], user);
    },
  });
}

export function useRegisterMutation() {
  const qc = useQueryClient();

  return useMutation<UserRead, Error, {
    full_name: string;
    email: string;
    password: string;
    password_confirm: string;
  }>({
    mutationFn: async (payload) => {
      // 1) регистрация
      const resp = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
          password_confirm: payload.password_confirm,
          full_name: payload.full_name,
          role: 'candidate',
        }),
      });

      if (!resp.ok) {
        let msg = 'Ошибка регистрации';
        try {
          const data = await resp.json();
          if (typeof data?.detail === 'string') msg = data.detail;
        } catch {}
        throw new Error(msg);
      }

      // 2) логин теми же данными
      const loginResp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: payload.email,
          password: payload.password,
        }),
      });

      if (!loginResp.ok) {
        throw new Error('Регистрация прошла, но вход не удался');
      }

      const loginData = (await loginResp.json()) as LoginResponse;
      setAuthToken(loginData.access_token);

      const user = await apiFetch<UserRead>('/users/me');
      return user;
    },
    onSuccess: (user) => {
      qc.setQueryData(['currentUser'], user);
    },
  });
}

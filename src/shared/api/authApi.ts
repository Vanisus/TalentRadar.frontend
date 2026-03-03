// src/shared/api/authApi.ts
import { http } from './http';
import type { AuthUser } from '@/app/authSlice';
import { apiFetch, setAuthToken } from '../api';

export async function logoutRequest() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // даже если бэк вернул ошибку — всё равно чистим фронт
  } finally {
    setAuthToken(null); // тоже чистим через setAuthToken
  }
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await http.get('/users/me'); // users/me возвращает UserRead с fullname[file:2]
  return {
    id: data.id,
    email: data.email,
    fullname: data.fullname,
    role: data.role,
  };
}





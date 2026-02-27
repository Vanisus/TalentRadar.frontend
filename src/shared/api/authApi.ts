// src/shared/api/authApi.ts
import { http } from './http';
import type { AuthUser } from '@/app/authSlice';

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await http.get('/users/me'); // users/me возвращает UserRead с fullname[file:2]
  return {
    id: data.id,
    email: data.email,
    fullname: data.fullname,
    role: data.role,
  };
}

export async function logoutRequest() {
  await http.post('/auth/logout'); // POST /auth/logout[file:2]
}

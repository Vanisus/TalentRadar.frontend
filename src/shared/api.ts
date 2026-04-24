// src/shared/api.ts
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function getAuthToken() {
  return localStorage.getItem('token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let resp: Response;
  try {
    resp = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    // Сетевая ошибка (offline, CORS, DNS)
    throw new Error('Failed to fetch');
  }

  if (resp.status === 401) {
    setAuthToken(null);
    throw new Error('UNAUTHORIZED');
  }

  if (!resp.ok) {
    let message = `HTTP ${resp.status}`;
    try {
      const data = await resp.json();
      if (typeof (data as any).detail === 'string') {
        message = (data as any).detail;
      } else if (Array.isArray((data as any).detail)) {
        // Pydantic validation errors — берём первое сообщение
        message = (data as any).detail[0]?.msg ?? message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (resp.status === 204) {
    return null as T;
  }

  return (await resp.json()) as T;
}

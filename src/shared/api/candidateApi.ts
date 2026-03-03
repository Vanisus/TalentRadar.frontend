// src/shared/api/candidateApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const candidateApi = createApi({
  reducerPath: 'candidateApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: 'include',
  }),

  tagTypes: ['CandidateNotifications'],
  endpoints: (builder) => ({
    getCandidateNotifications: builder.query<Notification[], void>({
      query: () => '/candidates/notifications',
    }),
    markNotificationAsRead: builder.mutation<void, number>({
      query: (notificationId) => ({
        url: `/candidates/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
    }),
  }),
});

export const {
  useGetCandidateNotificationsQuery,
  useMarkNotificationAsReadMutation,
} = candidateApi;

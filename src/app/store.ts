// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { candidateApi } from '../shared/api/candidateApi';
import { authReducer } from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [candidateApi.reducerPath]: candidateApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(candidateApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

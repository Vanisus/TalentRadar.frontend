// src/app/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';

export interface AuthUser {
  id: number;
  email: string;
  fullname: string | null;
  role: 'candidate' | 'hr' | 'admin';
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('token'); 
    },
  },
});

export const { setAuth, setUser, clearAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;

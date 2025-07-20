"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthAPI, type User } from '@/lib/api/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearAuth: () => void;
  validateAuth: () => Promise<boolean>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const authResponse = await AuthAPI.login({ username, password });
          const user = await AuthAPI.getCurrentUser(authResponse.access_token);
          
          set({
            token: authResponse.access_token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Set cookie for middleware
          document.cookie = `auth-storage=${JSON.stringify({
            state: {
              token: authResponse.access_token,
              user,
              isAuthenticated: true,
            }
          })}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const { token } = get();
        if (token) {
          try {
            await AuthAPI.logout(token);
          } catch (error) {
            console.warn('Logout API call failed:', error);
          }
        }
        
        // Clear cookie
        document.cookie = 'auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        
        set(initialState);
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearAuth: () => {
        // Clear cookie
        document.cookie = 'auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        set(initialState);
      },

      validateAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }

        try {
          const isValid = await AuthAPI.validateToken(token);
          if (isValid) {
            set({ isAuthenticated: true });
            return true;
          } else {
            set(initialState);
            return false;
          }
        } catch {
          set(initialState);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
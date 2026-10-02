import type { User } from '../../domain/auth/entities/user';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  activeTab: 'login' | 'register';
  rememberMe: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  successMessage: null,
  activeTab: 'login',
  rememberMe: true,
};

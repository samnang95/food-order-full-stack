import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthState } from '../auth_state';
import { initialAuthState } from '../auth_state';
import type { AuthIntent } from '../auth_intent';
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
} from '../../../domain/auth';
import { AuthRepositoryImpl } from '../../../data/auth/repositories/auth_repository_impl';

export const useAuthStore = defineStore('auth', () => {
  // Repository & Use Cases
  const authRepository = new AuthRepositoryImpl();
  const loginUseCase = new LoginUseCase(authRepository);
  const registerUseCase = new RegisterUseCase(authRepository);
  const logoutUseCase = new LogoutUseCase(authRepository);
  const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

  // State
  const state = ref<AuthState>({ ...initialAuthState });

  // Init from local storage if available
  const storedSession = authRepository.getStoredSession();
  if (storedSession) {
    state.value.user = storedSession.user;
    state.value.token = storedSession.token;
    state.value.isAuthenticated = true;
  }

  // Getters
  const isAuthenticated = computed(() => state.value.isAuthenticated && Boolean(state.value.token));
  const currentUser = computed(() => state.value.user);
  const userRole = computed(() => state.value.user?.role || 'admin');
  const isLoading = computed(() => state.value.isLoading);
  const error = computed(() => state.value.error);
  const activeTab = computed(() => state.value.activeTab);

  // Intent Handlers (MVI dispatch pattern)
  async function dispatch(intent: AuthIntent): Promise<boolean> {
    switch (intent.type) {
      case 'LOGIN': {
        state.value.isLoading = true;
        state.value.error = null;
        state.value.successMessage = null;

        try {
          const session = await loginUseCase.execute(intent.payload);
          state.value.user = session.user;
          state.value.token = session.token;
          state.value.isAuthenticated = true;
          state.value.successMessage = `Welcome back, ${session.user.username}!`;
          return true;
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Login failed. Please try again.';
          state.value.isAuthenticated = false;
          return false;
        } finally {
          state.value.isLoading = false;
        }
      }

      case 'REGISTER': {
        state.value.isLoading = true;
        state.value.error = null;
        state.value.successMessage = null;

        try {
          const session = await registerUseCase.execute(intent.payload);
          state.value.user = session.user;
          state.value.token = session.token;
          state.value.isAuthenticated = true;
          state.value.successMessage = 'Account created successfully!';
          return true;
        } catch (err: unknown) {
          state.value.error = err instanceof Error ? err.message : 'Registration failed. Please try again.';
          return false;
        } finally {
          state.value.isLoading = false;
        }
      }

      case 'LOGOUT': {
        state.value.isLoading = true;
        try {
          await logoutUseCase.execute();
        } finally {
          state.value.user = null;
          state.value.token = null;
          state.value.isAuthenticated = false;
          state.value.error = null;
          state.value.successMessage = null;
          state.value.isLoading = false;
        }
        return true;
      }

      case 'CHECK_AUTH': {
        const session = authRepository.getStoredSession();
        if (session) {
          state.value.user = session.user;
          state.value.token = session.token;
          state.value.isAuthenticated = true;
          // Refresh user in background
          getCurrentUserUseCase.execute().then((refreshedUser) => {
            if (refreshedUser) {
              state.value.user = refreshedUser;
            }
          });
          return true;
        } else {
          state.value.user = null;
          state.value.token = null;
          state.value.isAuthenticated = false;
          return false;
        }
      }

      case 'SET_TAB': {
        state.value.activeTab = intent.payload;
        state.value.error = null;
        return true;
      }

      case 'CLEAR_ERROR': {
        state.value.error = null;
        return true;
      }

      case 'SET_REMEMBER_ME': {
        state.value.rememberMe = intent.payload;
        return true;
      }
    }
  }

  // Convenience methods
  const login = (params: Parameters<typeof loginUseCase.execute>[0]) =>
    dispatch({ type: 'LOGIN', payload: params });

  const register = (params: Parameters<typeof registerUseCase.execute>[0]) =>
    dispatch({ type: 'REGISTER', payload: params });

  const logout = () => dispatch({ type: 'LOGOUT' });

  const setTab = (tab: 'login' | 'register') =>
    dispatch({ type: 'SET_TAB', payload: tab });

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return {
    state,
    isAuthenticated,
    currentUser,
    userRole,
    isLoading,
    error,
    activeTab,
    dispatch,
    login,
    register,
    logout,
    setTab,
    clearError,
  };
});

import type { User } from '../entities/user';
import type { AuthSession } from '../entities/auth_session';

export interface LoginParams {
  username: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterParams {
  username: string;
  email: string;
  password?: string;
  role?: string;
}

export interface AuthRepository {
  login(params: LoginParams): Promise<AuthSession>;
  register(params: RegisterParams): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getStoredSession(): AuthSession | null;
  clearSession(): void;
}

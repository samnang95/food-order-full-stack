import type { User } from './user';

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt?: number;
}

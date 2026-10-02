import type { LoginParams, RegisterParams } from '../../domain/auth/repositories/auth_repository';

export type AuthIntent =
  | { type: 'LOGIN'; payload: LoginParams }
  | { type: 'REGISTER'; payload: RegisterParams }
  | { type: 'LOGOUT' }
  | { type: 'CHECK_AUTH' }
  | { type: 'SET_TAB'; payload: 'login' | 'register' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_REMEMBER_ME'; payload: boolean };

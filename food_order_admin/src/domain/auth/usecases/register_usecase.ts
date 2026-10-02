import type { AuthRepository, RegisterParams } from '../repositories/auth_repository';
import type { AuthSession } from '../entities/auth_session';

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(params: RegisterParams): Promise<AuthSession> {
    if (!params.username.trim()) {
      throw new Error('Username is required');
    }
    if (!params.email.trim() || !params.email.includes('@')) {
      throw new Error('Valid email address is required');
    }
    if (!params.password || params.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    return this.authRepository.register(params);
  }
}

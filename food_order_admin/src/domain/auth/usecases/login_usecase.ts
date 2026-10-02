import type { AuthRepository, LoginParams } from '../repositories/auth_repository';
import type { AuthSession } from '../entities/auth_session';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(params: LoginParams): Promise<AuthSession> {
    if (!params.username.trim()) {
      throw new Error('Username or email is required');
    }
    if (!params.password) {
      throw new Error('Password is required');
    }
    return this.authRepository.login(params);
  }
}

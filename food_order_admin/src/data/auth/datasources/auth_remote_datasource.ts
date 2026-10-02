import { apiClient } from '../../../core/services/api_client';
import type { ApiAuthResponse, ApiUserResponse } from '../models/user_model';
import type { LoginParams, RegisterParams } from '../../../domain/auth/repositories/auth_repository';

export class AuthRemoteDataSource {
  async login(params: LoginParams): Promise<ApiAuthResponse> {
    const response = await apiClient.post<ApiAuthResponse>('/auth/login', {
      username: params.username,
      password: params.password,
    });
    return response.data;
  }

  async register(params: RegisterParams): Promise<ApiAuthResponse> {
    const response = await apiClient.post<ApiAuthResponse>('/auth/register', {
      username: params.username,
      email: params.email,
      password: params.password,
    });
    return response.data;
  }

  async getProfile(): Promise<ApiUserResponse> {
    const response = await apiClient.get<ApiUserResponse>('/auth/profile');
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Best-effort logout on API
    }
  }
}

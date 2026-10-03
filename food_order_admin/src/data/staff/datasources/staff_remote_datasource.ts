import { apiClient } from '../../../core/services/api_client';
import type { ApiUserDto } from '../models/staff_model';
import type { CreateStaffParams, UpdateStaffRoleParams } from '../../../domain/staff/repositories/staff_repository';

export class StaffRemoteDataSource {
  async fetchUsers(): Promise<ApiUserDto[]> {
    const res = await apiClient.get<ApiUserDto[]>('/users');
    return res.data;
  }

  async createStaff(params: CreateStaffParams): Promise<ApiUserDto> {
    const res = await apiClient.post<{ user: ApiUserDto }>('/auth/register', {
      username: params.username,
      email: params.email,
      password: params.password || `${params.username}123`,
      role: params.role,
    });
    return res.data.user;
  }

  async updateRole(params: UpdateStaffRoleParams): Promise<ApiUserDto> {
    const res = await apiClient.put<{ user: ApiUserDto }>(`/users/${params.id}/role`, {
      role: params.role,
    });
    return res.data.user;
  }
}

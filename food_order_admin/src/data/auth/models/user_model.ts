import type { User, UserRole } from '../../../domain/auth/entities/user';
import type { AuthSession } from '../../../domain/auth/entities/auth_session';

export interface ApiUserResponse {
  _id?: string;
  id?: string;
  username: string;
  email?: string;
  role?: string;
  avatar?: string;
  title?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiAuthResponse {
  message?: string;
  token: string;
  refreshToken?: string;
  user: ApiUserResponse;
}

export class UserModel {
  static fromApiResponse(dto: ApiUserResponse): User {
    const roleMap: Record<string, UserRole> = {
      admin: 'admin',
      manager: 'manager',
      kitchen: 'kitchen',
      staff: 'staff',
      user: 'admin', // default to admin in admin dashboard if role is generic user
    };

    return {
      id: dto._id || dto.id || `user_${Date.now()}`,
      username: dto.username,
      email: dto.email || `${dto.username.toLowerCase()}@foodhub.com`,
      role: roleMap[dto.role || 'admin'] || 'admin',
      avatar: dto.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      title: dto.title || 'Kitchen Director & Operations',
      department: dto.department || 'Executive Culinary Ops',
      createdAt: dto.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  }

  static toSession(dto: ApiAuthResponse): AuthSession {
    return {
      token: dto.token,
      refreshToken: dto.refreshToken,
      user: UserModel.fromApiResponse(dto.user),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days default
    };
  }
}

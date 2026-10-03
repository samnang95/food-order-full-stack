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
      user: 'admin',
    };

    const resolvedRole = roleMap[dto.role?.toLowerCase() || 'admin'] || 'admin';

    const defaultRoleData: Record<UserRole, { title: string; dept: string; avatar: string }> = {
      admin: {
        title: 'Executive Director (Super Admin)',
        dept: 'Executive Management',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
      manager: {
        title: 'Store Operations Manager',
        dept: 'Restaurant Operations',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      },
      kitchen: {
        title: 'Executive Head Chef',
        dept: 'Kitchen Operations',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80',
      },
      staff: {
        title: 'Front Cashier & Orders Lead',
        dept: 'Front-of-House',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      },
      user: {
        title: 'Diner / Customer',
        dept: 'Patron',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      },
    };

    const meta = defaultRoleData[resolvedRole];

    return {
      id: dto._id || dto.id || `user_${Date.now()}`,
      username: dto.username,
      email: dto.email || `${dto.username.toLowerCase()}@foodhub.com`,
      role: resolvedRole,
      avatar: dto.avatar || meta.avatar,
      title: dto.title || meta.title,
      department: dto.department || meta.dept,
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

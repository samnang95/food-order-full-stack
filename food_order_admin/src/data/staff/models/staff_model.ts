import type { StaffMember, StaffStatus } from '../../../domain/staff/entities/staff_member';
import type { UserRole } from '../../../domain/auth/entities/user';
import { getRoleConfig } from '../../../core/auth/rbac';

export interface ApiUserDto {
  _id?: string;
  id?: string;
  username: string;
  email?: string;
  role?: string;
  avatar?: string;
  title?: string;
  department?: string;
  status?: string;
  phoneNumber?: string;
  shift?: string;
  ordersHandled?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class StaffModel {
  static fromApi(dto: ApiUserDto): StaffMember {
    const rawRole = (dto.role || 'staff').toLowerCase();
    const role: UserRole = ['admin', 'manager', 'kitchen', 'staff'].includes(rawRole)
      ? (rawRole as UserRole)
      : 'staff';

    const roleConfig = getRoleConfig(role);

    const roleAvatars: Record<UserRole, string> = {
      admin: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      manager: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      kitchen: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80',
      staff: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      user: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    };

    const validStatuses: StaffStatus[] = ['active', 'inactive', 'on_break'];
    const status: StaffStatus = validStatuses.includes(dto.status as StaffStatus)
      ? (dto.status as StaffStatus)
      : 'active';

    return {
      id: dto._id || dto.id || `staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: dto.username,
      email: dto.email || `${dto.username.toLowerCase()}@foodhub.com`,
      role,
      avatar: dto.avatar || roleAvatars[role],
      title: dto.title || roleConfig.title,
      department: dto.department || roleConfig.badge,
      status,
      phoneNumber: dto.phoneNumber || '+1 (555) 019-2834',
      shift: (dto.shift as StaffMember['shift']) || 'morning',
      ordersHandled: dto.ordersHandled ?? Math.floor(Math.random() * 80) + 12,
      createdAt: dto.createdAt || new Date().toISOString(),
      lastActiveAt: dto.updatedAt || new Date().toISOString(),
    };
  }
}

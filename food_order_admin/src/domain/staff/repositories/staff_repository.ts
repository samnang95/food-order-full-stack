import type { StaffMember, StaffStatus } from '../entities/staff_member';
import type { UserRole } from '../../auth/entities/user';

export interface CreateStaffParams {
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  title?: string;
  department?: string;
  phoneNumber?: string;
  shift?: 'morning' | 'evening' | 'night' | 'full_day';
}

export interface UpdateStaffRoleParams {
  id: string;
  role: UserRole;
  title?: string;
  status?: StaffStatus;
  shift?: 'morning' | 'evening' | 'night' | 'full_day';
}

export interface StaffRepository {
  getStaffList(): Promise<StaffMember[]>;
  createStaff(params: CreateStaffParams): Promise<StaffMember>;
  updateStaffRole(params: UpdateStaffRoleParams): Promise<StaffMember>;
  deleteStaff(id: string): Promise<void>;
}

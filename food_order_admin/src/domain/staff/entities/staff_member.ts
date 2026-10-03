import type { UserRole } from '../../auth/entities/user';

export type StaffStatus = 'active' | 'inactive' | 'on_break';

export interface StaffMember {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  department: string;
  status: StaffStatus;
  phoneNumber?: string;
  shift?: 'morning' | 'evening' | 'night' | 'full_day';
  ordersHandled?: number;
  createdAt?: string;
  lastActiveAt?: string;
}

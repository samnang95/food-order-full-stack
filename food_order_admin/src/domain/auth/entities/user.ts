export type UserRole = 'admin' | 'manager' | 'kitchen' | 'staff' | 'user';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  department?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

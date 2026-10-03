import type { CreateStaffParams, UpdateStaffRoleParams } from '../../domain/staff/repositories/staff_repository';
import type { UserRole } from '../../domain/auth/entities/user';
import type { StaffStatus } from '../../domain/staff/entities/staff_member';

export type StaffIntent =
  | { type: 'LOAD_STAFF' }
  | { type: 'CREATE_STAFF'; payload: CreateStaffParams }
  | { type: 'UPDATE_STAFF_ROLE'; payload: UpdateStaffRoleParams }
  | { type: 'DELETE_STAFF'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ROLE_FILTER'; payload: UserRole | 'all' }
  | { type: 'SET_STATUS_FILTER'; payload: StaffStatus | 'all' }
  | { type: 'OPEN_CREATE_MODAL' }
  | { type: 'OPEN_EDIT_MODAL'; payload: string }
  | { type: 'CLOSE_MODAL' };

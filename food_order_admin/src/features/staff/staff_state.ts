import type { StaffMember, StaffStatus } from '../../domain/staff/entities/staff_member';
import type { UserRole } from '../../domain/auth/entities/user';

export interface StaffState {
  staffList: StaffMember[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedRoleFilter: UserRole | 'all';
  selectedStatusFilter: StaffStatus | 'all';
  isModalOpen: boolean;
  modalMode: 'create' | 'edit';
  editingStaffId: string | null;
}

export const initialStaffState: StaffState = {
  staffList: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedRoleFilter: 'all',
  selectedStatusFilter: 'all',
  isModalOpen: false,
  modalMode: 'create',
  editingStaffId: null,
};

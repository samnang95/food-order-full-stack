import type {
  StaffRepository,
  CreateStaffParams,
  UpdateStaffRoleParams,
} from '../../../domain/staff/repositories/staff_repository';
import type { StaffMember } from '../../../domain/staff/entities/staff_member';
import { StaffRemoteDataSource } from '../datasources/staff_remote_datasource';
import { StaffLocalDataSource } from '../datasources/staff_local_datasource';
import { StaffModel } from '../models/staff_model';
import { getRoleConfig } from '../../../core/auth/rbac';

export class StaffRepositoryImpl implements StaffRepository {
  constructor(
    private readonly remoteDataSource = new StaffRemoteDataSource(),
    private readonly localDataSource = new StaffLocalDataSource()
  ) {}

  async getStaffList(): Promise<StaffMember[]> {
    try {
      const users = await this.remoteDataSource.fetchUsers();
      if (users && users.length > 0) {
        const staffList = users.map((u) => StaffModel.fromApi(u));
        this.localDataSource.saveStaffList(staffList);
        return staffList;
      }
    } catch (err) {
      console.warn('[StaffRepository] Failed to fetch remote users, falling back to local DB:', err);
    }
    return this.localDataSource.getStaffList();
  }

  async createStaff(params: CreateStaffParams): Promise<StaffMember> {
    const roleConfig = getRoleConfig(params.role);

    try {
      const remoteUser = await this.remoteDataSource.createStaff(params);
      const newStaff = StaffModel.fromApi(remoteUser);
      // Merge extra client-side fields if needed
      newStaff.title = params.title || roleConfig.title;
      newStaff.department = params.department || roleConfig.badge;
      newStaff.phoneNumber = params.phoneNumber || '+1 (555) 019-2834';
      newStaff.shift = params.shift || 'morning';
      this.localDataSource.addStaff(newStaff);
      return newStaff;
    } catch (err) {
      console.warn('[StaffRepository] Remote creation failed, saving to local DB:', err);

      const localMember: StaffMember = {
        id: `staff_loc_${Date.now()}`,
        username: params.username,
        email: params.email,
        role: params.role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        title: params.title || roleConfig.title,
        department: params.department || roleConfig.badge,
        status: 'active',
        phoneNumber: params.phoneNumber || '+1 (555) 019-2834',
        shift: params.shift || 'morning',
        ordersHandled: 0,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      this.localDataSource.addStaff(localMember);
      return localMember;
    }
  }

  async updateStaffRole(params: UpdateStaffRoleParams): Promise<StaffMember> {
    const roleConfig = getRoleConfig(params.role);

    try {
      await this.remoteDataSource.updateRole(params);
    } catch (err) {
      console.warn('[StaffRepository] Remote updateRole failed, updating locally:', err);
    }

    const currentList = this.localDataSource.getStaffList();
    const existing = currentList.find((s) => s.id === params.id);
    const updated: StaffMember = {
      ...(existing || {
        id: params.id,
        username: 'staff.member',
        email: 'staff@foodhub.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        department: roleConfig.badge,
        ordersHandled: 50,
      }),
      role: params.role,
      title: params.title || roleConfig.title,
      status: params.status || existing?.status || 'active',
      shift: params.shift || existing?.shift || 'morning',
      lastActiveAt: new Date().toISOString(),
    };

    this.localDataSource.updateStaff(updated);
    return updated;
  }

  async deleteStaff(id: string): Promise<void> {
    this.localDataSource.deleteStaff(id);
  }
}

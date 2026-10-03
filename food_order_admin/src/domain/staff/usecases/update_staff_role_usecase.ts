import type { StaffMember } from '../entities/staff_member';
import type { StaffRepository, UpdateStaffRoleParams } from '../repositories/staff_repository';

export class UpdateStaffRoleUseCase {
  constructor(private readonly repository: StaffRepository) {}

  async execute(params: UpdateStaffRoleParams): Promise<StaffMember> {
    if (!params.id) {
      throw new Error('Staff ID is required');
    }
    return await this.repository.updateStaffRole(params);
  }
}

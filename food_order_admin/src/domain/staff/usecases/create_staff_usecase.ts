import type { StaffMember } from '../entities/staff_member';
import type { StaffRepository, CreateStaffParams } from '../repositories/staff_repository';

export class CreateStaffUseCase {
  constructor(private readonly repository: StaffRepository) {}

  async execute(params: CreateStaffParams): Promise<StaffMember> {
    if (!params.username?.trim()) {
      throw new Error('Username is required');
    }
    if (!params.email?.trim()) {
      throw new Error('Email address is required');
    }
    return await this.repository.createStaff(params);
  }
}

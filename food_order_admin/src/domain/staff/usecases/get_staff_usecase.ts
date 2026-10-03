import type { StaffMember } from '../entities/staff_member';
import type { StaffRepository } from '../repositories/staff_repository';

export class GetStaffUseCase {
  constructor(private readonly repository: StaffRepository) {}

  async execute(): Promise<StaffMember[]> {
    return await this.repository.getStaffList();
  }
}

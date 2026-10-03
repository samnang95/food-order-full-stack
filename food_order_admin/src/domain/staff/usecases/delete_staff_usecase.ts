import type { StaffRepository } from '../repositories/staff_repository';

export class DeleteStaffUseCase {
  constructor(private readonly repository: StaffRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('Staff ID is required');
    }
    await this.repository.deleteStaff(id);
  }
}

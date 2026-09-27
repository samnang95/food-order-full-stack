/**
 * Use case to persist the user's selected delivery schedule.
 */
export class SaveDeliveryScheduleUseCase {
  constructor(scheduleRepository) {
    this.scheduleRepository = scheduleRepository;
  }

  async execute(schedule) {
    if (!schedule) {
      throw new Error('Delivery schedule payload is required.');
    }
    return this.scheduleRepository.saveDeliverySchedule(schedule);
  }
}

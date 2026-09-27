/**
 * Use case to retrieve the active delivery schedule.
 */
export class GetDeliveryScheduleUseCase {
  constructor(scheduleRepository) {
    this.scheduleRepository = scheduleRepository;
  }

  async execute() {
    return this.scheduleRepository.getDeliverySchedule();
  }
}

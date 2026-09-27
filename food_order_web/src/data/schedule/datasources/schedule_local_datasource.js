import { LocalDB } from '../../../core/db';
import { DeliveryScheduleModel } from '../models/delivery_schedule_model';

const SCHEDULE_STORAGE_KEY = 'bitecraft_delivery_schedule';

export class ScheduleLocalDataSource {
  getDeliverySchedule() {
    try {
      const stored = LocalDB.getItem(SCHEDULE_STORAGE_KEY);
      if (stored) {
        return DeliveryScheduleModel.fromJson(stored);
      }
    } catch (e) {
      console.warn('Failed to load schedule from LocalDB:', e);
    }
    return DeliveryScheduleModel.fromJson({ mode: 'asap' });
  }

  saveDeliverySchedule(scheduleEntity) {
    try {
      const json = DeliveryScheduleModel.toJson(scheduleEntity);
      LocalDB.setItem(SCHEDULE_STORAGE_KEY, json);
      return DeliveryScheduleModel.fromJson(json);
    } catch (e) {
      console.warn('Failed to save schedule to LocalDB:', e);
      return scheduleEntity;
    }
  }

  clearDeliverySchedule() {
    try {
      LocalDB.removeItem(SCHEDULE_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear schedule:', e);
    }
  }
}

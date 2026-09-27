import { DeliveryScheduleEntity } from '../../../domain/schedule/entities/delivery_schedule_entity';

export class DeliveryScheduleModel {
  static fromJson(raw = {}) {
    if (!raw) return new DeliveryScheduleEntity();

    return new DeliveryScheduleEntity({
      mode: raw.mode === 'scheduled' ? 'scheduled' : 'asap',
      date: raw.date || new Date().toISOString().split('T')[0],
      timeSlot: raw.timeSlot || '12:00 PM - 12:30 PM',
      note: raw.note || '',
    });
  }

  static toJson(entity) {
    if (!entity) return null;
    return {
      mode: entity.mode || 'asap',
      date: entity.date || new Date().toISOString().split('T')[0],
      timeSlot: entity.timeSlot || '12:00 PM - 12:30 PM',
      note: entity.note || '',
    };
  }
}

import { DeliveryScheduleEntity } from '../../domain/schedule/entities/delivery_schedule_entity';

export const initialScheduleState = {
  mode: 'asap', // 'asap' | 'scheduled'
  date: new Date().toISOString().split('T')[0],
  timeSlot: '12:00 PM - 12:30 PM',
  note: '',
  isModalOpen: false,
  isLoading: false,
  error: null,

  // Quick reorder status
  reorderLoadingOrderId: null,
  reorderSuccessResult: null,
  reorderErrorMessage: null,

  // Available preset time slots
  presetTimeSlots: DeliveryScheduleEntity.getPresetTimeSlots(),
};

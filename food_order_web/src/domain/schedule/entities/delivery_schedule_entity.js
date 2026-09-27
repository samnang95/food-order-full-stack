/**
 * Domain entity representing the chosen delivery timing mode and slot.
 */
export class DeliveryScheduleEntity {
  constructor({
    mode = 'asap', // 'asap' | 'scheduled'
    date = null, // YYYY-MM-DD
    timeSlot = '12:00 PM - 12:30 PM',
    note = '',
  } = {}) {
    this.mode = mode;
    this.date = date || new Date().toISOString().split('T')[0];
    this.timeSlot = timeSlot;
    this.note = note;
  }

  isAsap() {
    return this.mode === 'asap';
  }

  isScheduled() {
    return this.mode === 'scheduled';
  }

  getFormattedSchedule(t = (key) => key) {
    if (this.mode === 'asap') {
      return t('schedule.asapLabel') || '⚡ Deliver ASAP (25 - 35 mins)';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    let dayLabel = this.date;
    if (this.date === todayStr) {
      dayLabel = t('schedule.today') || 'Today';
    } else if (this.date === tomorrow) {
      dayLabel = t('schedule.tomorrow') || 'Tomorrow';
    }

    return `📅 ${dayLabel}, ${this.timeSlot}`;
  }

  static getPresetTimeSlots() {
    return [
      // Lunch Slots
      { id: 'lunch_1', category: 'lunch', label: '11:30 AM - 12:00 PM', icon: '🍱' },
      { id: 'lunch_2', category: 'lunch', label: '12:00 PM - 12:30 PM', icon: '🍱' },
      { id: 'lunch_3', category: 'lunch', label: '12:30 PM - 01:00 PM', icon: '🍱' },
      { id: 'lunch_4', category: 'lunch', label: '01:00 PM - 01:30 PM', icon: '🍱' },

      // Afternoon Snack / Tea Time
      { id: 'tea_1', category: 'afternoon', label: '02:30 PM - 03:00 PM', icon: '🧋' },
      { id: 'tea_2', category: 'afternoon', label: '03:30 PM - 04:00 PM', icon: '🧋' },
      { id: 'tea_3', category: 'afternoon', label: '04:30 PM - 05:00 PM', icon: '🧋' },

      // Dinner Slots
      { id: 'dinner_1', category: 'dinner', label: '06:00 PM - 06:30 PM', icon: '🍔' },
      { id: 'dinner_2', category: 'dinner', label: '06:30 PM - 07:00 PM', icon: '🍔' },
      { id: 'dinner_3', category: 'dinner', label: '07:00 PM - 07:30 PM', icon: '🍔' },
      { id: 'dinner_4', category: 'dinner', label: '07:30 PM - 08:00 PM', icon: '🍔' },
      { id: 'dinner_5', category: 'dinner', label: '08:00 PM - 08:30 PM', icon: '🍔' },
    ];
  }
}

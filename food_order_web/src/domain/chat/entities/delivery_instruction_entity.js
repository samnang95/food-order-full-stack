/**
 * Predefined and custom delivery instructions.
 */
export class DeliveryInstructionEntity {
  constructor({ id, icon, key, defaultEn, defaultKm, category = 'dropoff' }) {
    this.id = id;
    this.icon = icon;
    this.key = key;
    this.defaultEn = defaultEn;
    this.defaultKm = defaultKm;
    this.category = category; // 'dropoff' | 'call' | 'utensils' | 'custom'
  }

  static getDefaultPresets() {
    return [
      new DeliveryInstructionEntity({
        id: 'inst_lobby',
        icon: '🏢',
        key: 'chat.presets.lobby',
        defaultEn: "I'm waiting at the building lobby",
        defaultKm: 'ខ្ញុំរង់ចាំនៅខាងមុខអគារ / Lobby',
        category: 'dropoff',
      }),
      new DeliveryInstructionEntity({
        id: 'inst_door',
        icon: '🚪',
        key: 'chat.presets.door',
        defaultEn: 'Please leave at the door / gate',
        defaultKm: 'សូមទុកនៅមាត់ទ្វារ ឬមុខរបង',
        category: 'dropoff',
      }),
      new DeliveryInstructionEntity({
        id: 'inst_call',
        icon: '📞',
        key: 'chat.presets.callArrival',
        defaultEn: 'Please call me when you arrive',
        defaultKm: 'សូមទូរស័ព្ទមកពេលមកដល់',
        category: 'call',
      }),
      new DeliveryInstructionEntity({
        id: 'inst_bell',
        icon: '🔔',
        key: 'chat.presets.ringBell',
        defaultEn: 'Ring the doorbell, please',
        defaultKm: 'សូមចុចកណ្តឹង',
        category: 'dropoff',
      }),
      new DeliveryInstructionEntity({
        id: 'inst_chili',
        icon: '🌶️',
        key: 'chat.presets.extraChili',
        defaultEn: 'Please ask for extra chili & sauces',
        defaultKm: 'សុំម្ទេស និងទឹកជ្រលក់បន្ថែម',
        category: 'utensils',
      }),
      new DeliveryInstructionEntity({
        id: 'inst_gate',
        icon: '🔑',
        key: 'chat.presets.gateCode',
        defaultEn: 'Intercom / Gate code provided',
        defaultKm: 'លេខកូដរបង ឬទ្វារចូល',
        category: 'dropoff',
      }),
    ];
  }
}

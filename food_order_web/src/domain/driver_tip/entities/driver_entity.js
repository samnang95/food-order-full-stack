export const DRIVER_COMPLIMENTS = {
  SUPER_FAST: 'super_fast',
  CAREFUL_HANDLING: 'careful_handling',
  FRIENDLY_SMILE: 'friendly_smile',
  FOLLOWED_NOTES: 'followed_notes',
  GREAT_COMMUNICATION: 'great_communication',
  WEATHER_HERO: 'weather_hero',
};

export class DriverEntity {
  constructor({
    id = 'driver_001',
    name = 'Sok Dara',
    phone = '012 889 922',
    avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    vehicle = 'Honda Wave 125i',
    plateNumber = 'Phnom Penh 1AC-9281',
    rating = 4.96,
    totalDeliveries = 482,
    badgeCounts = {
      super_fast: 148,
      careful_handling: 196,
      friendly_smile: 212,
      followed_notes: 95,
      weather_hero: 64,
    },
  } = {}) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.avatar = avatar;
    this.vehicle = vehicle;
    this.plateNumber = plateNumber;
    this.rating = Number(rating) || 4.96;
    this.totalDeliveries = Number(totalDeliveries) || 482;
    this.badgeCounts = badgeCounts || {};
  }
}

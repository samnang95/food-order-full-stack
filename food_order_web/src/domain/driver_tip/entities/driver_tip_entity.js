export class DriverTipEntity {
  constructor({
    id = `tip_${Date.now()}`,
    orderId = '',
    driverId = 'driver_001',
    amountUsd = 0,
    amountKhr = 0,
    paymentMethod = 'checkout_add_on', // 'checkout_add_on', 'bakong_khqr', 'cash'
    compliments = [],
    note = '',
    status = 'completed', // 'completed', 'pending'
    khqrPayload = null,
    createdAt = new Date(),
  } = {}) {
    this.id = id;
    this.orderId = orderId;
    this.driverId = driverId;
    this.amountUsd = Number(amountUsd) || 0;
    this.amountKhr = Number(amountKhr) || Math.round(this.amountUsd * 4100);
    this.paymentMethod = paymentMethod;
    this.compliments = Array.isArray(compliments) ? compliments : [];
    this.note = note || '';
    this.status = status;
    this.khqrPayload = khqrPayload;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }

  get formattedUsd() {
    return `$${this.amountUsd.toFixed(2)}`;
  }

  get formattedKhr() {
    return `${this.amountKhr.toLocaleString()} ៛`;
  }
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'on_delivery' | 'delivered' | 'cancelled';

export class OrderItemEntity {
  id: string;
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  specialInstructions?: string;

  constructor(data: Partial<OrderItemEntity>) {
    this.id = data.id || '';
    this.foodId = data.foodId || '';
    this.name = data.name || 'Unnamed Dish';
    this.price = Number(data.price) || 0;
    this.quantity = Number(data.quantity) || 1;
    this.image = data.image;
    this.specialInstructions = data.specialInstructions;
  }

  get total(): number {
    return this.price * this.quantity;
  }
}

export class OrderEntity {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItemEntity[];
  subtotal: number;
  deliveryFee: number;
  driverTip: number;
  discount: number;
  total: number;
  paymentMethod: 'card' | 'cash' | 'digital_wallet';
  paymentStatus: 'paid' | 'pending' | 'failed';
  status: OrderStatus;
  createdAt: string;
  estimatedDeliveryMinutes: number;
  notes?: string;

  constructor(data: Partial<OrderEntity>) {
    this.id = data.id || '';
    this.orderNumber = data.orderNumber || '';
    this.customerName = data.customerName || 'Guest';
    this.customerPhone = data.customerPhone || '';
    this.customerAddress = data.customerAddress || '';
    this.items = (data.items || []).map((i) => (i instanceof OrderItemEntity ? i : new OrderItemEntity(i)));
    this.subtotal = Number(data.subtotal) || 0;
    this.deliveryFee = Number(data.deliveryFee) || 0;
    this.driverTip = Number(data.driverTip) || 0;
    this.discount = Number(data.discount) || 0;
    this.total = Number(data.total) || 0;
    this.paymentMethod = data.paymentMethod || 'card';
    this.paymentStatus = data.paymentStatus || 'paid';
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || 'Just now';
    this.estimatedDeliveryMinutes = Number(data.estimatedDeliveryMinutes) || 30;
    this.notes = data.notes;
  }
}

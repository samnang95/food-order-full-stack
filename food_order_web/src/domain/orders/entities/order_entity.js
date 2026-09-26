export const OrderStatus = Object.freeze({
  PENDING: 'pending',
  PREPARING: 'preparing',
  ON_THE_WAY: 'on_the_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

export class OrderItemEntity {
  constructor({
    id = '',
    foodId = '',
    foodName = 'Item',
    foodImageUrl = '',
    price = 0,
    quantity = 1,
  } = {}) {
    this.id = id;
    this.foodId = foodId;
    this.foodName = foodName;
    this.foodImageUrl = foodImageUrl;
    this.price = Number(price) || 0;
    this.quantity = Number(quantity) || 1;
  }

  get totalPrice() {
    return this.price * this.quantity;
  }
}

export class OrderEntity {
  constructor({
    id = '',
    orderNumber = '',
    userId = '',
    customerName = 'Guest Customer',
    customerPhone = '',
    items = [],
    totalAmount = 0,
    deliveryAddress = 'Phnom Penh, Cambodia',
    status = OrderStatus.PENDING,
    paymentMethod = 'cash',
    paymentStatus = 'pending',
    createdAt = new Date(),
    updatedAt = new Date(),
    notes = '',
  } = {}) {
    this.id = id;
    this.orderNumber = orderNumber || (id ? `#${id.slice(-6).toUpperCase()}` : '#ORD-0000');
    this.userId = userId;
    this.customerName = customerName;
    this.customerPhone = customerPhone;
    this.items = items.map((item) =>
      item instanceof OrderItemEntity ? item : new OrderItemEntity(item)
    );
    this.totalAmount = Number(totalAmount) || 0;
    this.deliveryAddress = deliveryAddress;
    this.status = (status || OrderStatus.PENDING).toLowerCase();
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
    this.notes = notes;
  }

  // Domain Business Getters
  get isPending() {
    return this.status === OrderStatus.PENDING;
  }

  get isPreparing() {
    return this.status === OrderStatus.PREPARING;
  }

  get isOnTheWay() {
    return this.status === OrderStatus.ON_THE_WAY;
  }

  get isDelivered() {
    return this.status === OrderStatus.DELIVERED;
  }

  get isCancelled() {
    return this.status === OrderStatus.CANCELLED;
  }

  get totalItemsCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get formattedTotalUSD() {
    return `$${this.totalAmount.toFixed(2)}`;
  }

  get formattedTotalKHR() {
    const khr = Math.round(this.totalAmount * 4100);
    return `${khr.toLocaleString()} ៛`;
  }

  get formattedDate() {
    try {
      return this.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  }

  get nextValidStatus() {
    switch (this.status) {
      case OrderStatus.PENDING:
        return OrderStatus.PREPARING;
      case OrderStatus.PREPARING:
        return OrderStatus.ON_THE_WAY;
      case OrderStatus.ON_THE_WAY:
        return OrderStatus.DELIVERED;
      default:
        return null;
    }
  }
}

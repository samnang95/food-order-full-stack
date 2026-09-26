import { OrderEntity, OrderItemEntity, OrderStatus } from '../../../domain/orders/entities/order_entity';

export class OrderModel {

  static fromJson(raw = {}) {
    const id = raw._id || raw.id || '';
    
    // Normalize customer user info
    let customerName = 'Guest Customer';
    let customerPhone = '';
    let userId = '';

    if (raw.user && typeof raw.user === 'object') {
      userId = raw.user._id || raw.user.id || '';
      customerName = raw.user.name || raw.user.fullName || raw.user.email || 'Customer';
      customerPhone = raw.user.phone || '';
    } else if (typeof raw.user === 'string') {
      userId = raw.user;
    }

    if (raw.customerName) customerName = raw.customerName;
    if (raw.customerPhone) customerPhone = raw.customerPhone;

    // Normalize items
    const rawItems = Array.isArray(raw.items) ? raw.items : [];
    const items = rawItems.map((item, idx) => {
      const itemId = item._id || item.id || `item-${idx}`;
      let foodId = '';
      let foodName = 'Food Item';
      let foodImageUrl = '';
      let price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;

      if (item.food && typeof item.food === 'object') {
        foodId = item.food._id || item.food.id || '';
        foodName = item.food.name || item.food.title || foodName;
        foodImageUrl = item.food.imageUrl || item.food.image || '';
        if (!price && item.food.price) price = Number(item.food.price);
      } else if (item.food && typeof item.food === 'string') {
        foodId = item.food;
      }

      if (item.foodName) foodName = item.foodName;
      if (item.foodImageUrl) foodImageUrl = item.foodImageUrl;

      return new OrderItemEntity({
        id: itemId,
        foodId,
        foodName,
        foodImageUrl,
        price,
        quantity,
      });
    });

    return new OrderEntity({
      id,
      orderNumber: raw.orderNumber || (id ? `#${id.slice(-6).toUpperCase()}` : '#ORD-0000'),
      userId,
      customerName,
      customerPhone,
      items,
      totalAmount: Number(raw.totalAmount) || 0,
      deliveryAddress:
        typeof raw.deliveryAddress === 'string'
          ? raw.deliveryAddress
          : raw.deliveryAddress?.address || 'Phnom Penh, Cambodia',
      status: (raw.status || OrderStatus.PENDING).toLowerCase(),
      paymentMethod: raw.paymentMethod || 'cash',
      paymentStatus: raw.paymentStatus || 'pending',
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
      notes: raw.notes || raw.specialInstructions || '',
    });
  }

  static toJson(entity) {
    return {
      id: entity.id,
      status: entity.status,
      totalAmount: entity.totalAmount,
      items: entity.items.map((i) => ({
        food: i.foodId,
        foodName: i.foodName,
        foodImageUrl: i.foodImageUrl,
        quantity: i.quantity,
        price: i.price,
      })),
      deliveryAddress: entity.deliveryAddress,
      paymentMethod: entity.paymentMethod,
      paymentStatus: entity.paymentStatus,
    };
  }
}

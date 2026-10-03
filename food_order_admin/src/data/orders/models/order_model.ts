import { OrderEntity, OrderItemEntity, type OrderStatus } from '../../../domain/orders/entities/order_entity';

export interface OrderItemModelData {
  id: string;
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  specialInstructions?: string;
  addedBy?: { id?: string; name?: string; color?: string };
}

export interface OrderModelData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItemModelData[];
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
  isGroupOrder?: boolean;
  groupOrder?: { groupId?: string; code?: string; title?: string; members?: any[] };
}

export class OrderModel {
  static toEntity(raw: OrderModelData): OrderEntity {
    return new OrderEntity({
      id: raw.id,
      orderNumber: raw.orderNumber,
      customerName: raw.customerName,
      customerPhone: raw.customerPhone,
      customerAddress: raw.customerAddress,
      items: (raw.items || []).map((i) => new OrderItemEntity(i)),
      subtotal: raw.subtotal,
      deliveryFee: raw.deliveryFee,
      driverTip: raw.driverTip,
      discount: raw.discount,
      total: raw.total,
      paymentMethod: raw.paymentMethod,
      paymentStatus: raw.paymentStatus,
      status: raw.status,
      createdAt: raw.createdAt,
      estimatedDeliveryMinutes: raw.estimatedDeliveryMinutes,
      notes: raw.notes,
      isGroupOrder: raw.isGroupOrder,
      groupOrder: raw.groupOrder,
    });
  }


  static fromEntity(entity: OrderEntity): OrderModelData {
    return {
      id: entity.id,
      orderNumber: entity.orderNumber,
      customerName: entity.customerName,
      customerPhone: entity.customerPhone,
      customerAddress: entity.customerAddress,
      items: entity.items.map((i) => ({
        id: i.id,
        foodId: i.foodId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        specialInstructions: i.specialInstructions,
      })),
      subtotal: entity.subtotal,
      deliveryFee: entity.deliveryFee,
      driverTip: entity.driverTip,
      discount: entity.discount,
      total: entity.total,
      paymentMethod: entity.paymentMethod,
      paymentStatus: entity.paymentStatus,
      status: entity.status,
      createdAt: entity.createdAt,
      estimatedDeliveryMinutes: entity.estimatedDeliveryMinutes,
      notes: entity.notes,
    };
  }
}

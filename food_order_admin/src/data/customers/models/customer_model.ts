import { CustomerEntity } from '../../../domain/customers/entities/customer_entity';

export interface CustomerModelData {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  joinedDate: string;
  avatar: string;
}

export class CustomerModel {
  static toEntity(raw: CustomerModelData): CustomerEntity {
    return new CustomerEntity(raw);
  }

  static fromEntity(entity: CustomerEntity): CustomerModelData {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      totalOrders: entity.totalOrders,
      totalSpent: entity.totalSpent,
      status: entity.status,
      joinedDate: entity.joinedDate,
      avatar: entity.avatar,
    };
  }
}

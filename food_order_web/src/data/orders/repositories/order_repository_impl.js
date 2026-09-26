import { IOrderRepository } from '../../../domain/orders/repositories/order_repository';
import { OrderModel } from '../models/order_model';
import { OrderRemoteDataSource } from '../datasources/order_remote_datasource';

export class OrderRepositoryImpl extends IOrderRepository {
  constructor(remoteDataSource = new OrderRemoteDataSource()) {
    super();
    this.remoteDataSource = remoteDataSource;
  }

  async getOrders(filter = {}) {
    const rawList = await this.remoteDataSource.fetchOrders(filter);
    return rawList.map((item) => OrderModel.fromJson(item));
  }

  async getOrderById(orderId) {
    const raw = await this.remoteDataSource.fetchOrderById(orderId);
    return OrderModel.fromJson(raw);
  }

  async updateOrderStatus(orderId, status, paymentStatus) {
    const raw = await this.remoteDataSource.updateOrderStatus(orderId, status, paymentStatus);
    return OrderModel.fromJson(raw);
  }

  async cancelOrder(orderId, reason) {
    const raw = await this.remoteDataSource.cancelOrder(orderId, reason);
    return OrderModel.fromJson(raw);
  }
}

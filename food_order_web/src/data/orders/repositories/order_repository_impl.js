import { IOrderRepository } from '../../../domain/orders/repositories/order_repository';
import { OrderModel } from '../models/order_model';
import { OrderRemoteDataSource } from '../datasources/order_remote_datasource';
import { LocalDB, DBKeys } from '../../../core/db';

export class OrderRepositoryImpl extends IOrderRepository {
  constructor(
    remoteDataSource = new OrderRemoteDataSource(),
    localDb = LocalDB
  ) {
    super();
    this.remoteDataSource = remoteDataSource;
    this.localDb = localDb;
  }

  async getOrders(filter = {}) {
    try {
      const rawList = await this.remoteDataSource.fetchOrders(filter);
      if (Array.isArray(rawList) && rawList.length > 0) {
        this.localDb.setJSON(DBKeys.CACHED_ORDERS, rawList);
      }
      return rawList.map((item) => OrderModel.fromJson(item));
    } catch (error) {
      // Graceful offline fallback from local storage
      const cached = this.localDb.getJSON(DBKeys.CACHED_ORDERS, []);
      if (cached.length > 0) {
        return cached.map((item) => OrderModel.fromJson(item));
      }
      throw error;
    }
  }

  async getMyOrders() {
    return this.getOrders();
  }

  async getOrderById(orderId) {
    if (!orderId) throw new Error('Order ID is required');

    // 1. Try fetching fresh order state from remote backend API
    try {
      const raw = await this.remoteDataSource.fetchOrderById(orderId);
      if (raw && (raw._id || raw.id)) {
        this._updateCachedOrder(raw);
        return OrderModel.fromJson(raw);
      }
    } catch (apiErr) {
      console.debug(`[OrderRepository] Remote fetch failed for #${orderId}: ${apiErr.message}`);
    }

    // 2. Fallback to cached orders in local persistence
    const cachedList = this.localDb.getJSON(DBKeys.CACHED_ORDERS, []);
    const matched = cachedList.find((o) => (o.id || o._id) === orderId);
    if (matched) {
      return OrderModel.fromJson(matched);
    }

    throw new Error(`Order #${orderId.slice(-6).toUpperCase()} not found or access expired.`);
  }

  async createOrder(orderData) {
    const raw = await this.remoteDataSource.createOrder(orderData);
    this._updateCachedOrder(raw);
    return OrderModel.fromJson(raw);
  }

  async updateOrderStatus(orderId, status, paymentStatus) {
    const raw = await this.remoteDataSource.updateOrderStatus(orderId, status, paymentStatus);
    this._updateCachedOrder(raw);
    return OrderModel.fromJson(raw);
  }

  async cancelOrder(orderId, reason) {
    const raw = await this.remoteDataSource.cancelOrder(orderId, reason);
    this._updateCachedOrder(raw);
    return OrderModel.fromJson(raw);
  }

  _updateCachedOrder(rawOrder) {
    if (!rawOrder || (!rawOrder.id && !rawOrder._id)) return;
    try {
      const orderId = rawOrder.id || rawOrder._id;
      const cachedList = this.localDb.getJSON(DBKeys.CACHED_ORDERS, []);
      const existingIdx = cachedList.findIndex((o) => (o.id || o._id) === orderId);
      if (existingIdx >= 0) {
        cachedList[existingIdx] = { ...cachedList[existingIdx], ...rawOrder };
      } else {
        cachedList.unshift(rawOrder);
      }
      this.localDb.setJSON(DBKeys.CACHED_ORDERS, cachedList);
    } catch {
      // Non-blocking cache failure
    }
  }
}

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

  async getOrderAnalytics() {
    try {
      const data = await this.remoteDataSource.fetchOrderAnalytics();
      if (data && typeof data === 'object' && (data.totalSpent !== undefined || data.totalOrders !== undefined)) {
        return data;
      }
    } catch (err) {
      console.debug('[OrderRepositoryImpl] Remote analytics fetch fallback:', err.message);
    }

    // Local fallback: compute from cached orders
    const cachedOrders = this.localDb.getJSON(DBKeys.CACHED_ORDERS, []);
    return this._computeLocalAnalytics(cachedOrders);
  }

  _computeLocalAnalytics(orders = []) {
    let totalSpent = 0;
    let totalSavings = 0;
    let deliveredCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    const dishCounts = {};
    const monthsMap = {};
    const daysMap = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const hoursMap = { Morning: 0, Lunch: 0, Afternoon: 0, Dinner: 0, LateNight: 0 };
    const paymentMap = {};

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      monthsMap[key] = { key, month: monthLabel, year: d.getFullYear(), spent: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const status = (o.status || 'pending').toLowerCase();
      const amount = Number(o.totalAmount) || 0;
      const discount = Number(o.discountAmount) || 0;

      if (status === 'delivered') deliveredCount++;
      else if (status === 'cancelled') cancelledCount++;
      else pendingCount++;

      if (status !== 'cancelled') {
        totalSpent += amount;
        totalSavings += discount;

        const pMethod = o.paymentMethod || 'cash';
        paymentMap[pMethod] = (paymentMap[pMethod] || 0) + 1;

        if (Array.isArray(o.items)) {
          o.items.forEach((item) => {
            const food = item.food || {};
            const foodName = food.name || item.foodName || 'Delicious Dish';
            const foodImage = food.imageUrl || item.foodImageUrl || '';
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || (Number(food.price) || 0);

            if (!dishCounts[foodName]) {
              dishCounts[foodName] = {
                name: foodName,
                imageUrl: foodImage,
                quantity: 0,
                totalSpent: 0,
                ordersCount: 0,
              };
            }
            dishCounts[foodName].quantity += qty;
            dishCounts[foodName].totalSpent += price * qty;
            dishCounts[foodName].ordersCount += 1;
            if (!dishCounts[foodName].imageUrl && foodImage) {
              dishCounts[foodName].imageUrl = foodImage;
            }
          });
        }

        const date = new Date(o.createdAt || Date.now());
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthsMap[monthKey]) {
          monthsMap[monthKey].spent += amount;
          monthsMap[monthKey].orders += 1;
        }

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = dayNames[date.getDay()];
        if (day) daysMap[day] = (daysMap[day] || 0) + 1;

        const hour = date.getHours();
        if (hour >= 6 && hour < 11) hoursMap.Morning++;
        else if (hour >= 11 && hour < 14) hoursMap.Lunch++;
        else if (hour >= 14 && hour < 17) hoursMap.Afternoon++;
        else if (hour >= 17 && hour < 22) hoursMap.Dinner++;
        else hoursMap.LateNight++;
      }
    });

    const topDishes = Object.values(dishCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const monthlySpending = Object.values(monthsMap);
    const maxSpent = Math.max(...monthlySpending.map((m) => m.spent), 0);
    monthlySpending.forEach((m) => {
      m.isPeak = maxSpent > 0 && m.spent === maxSpent;
      m.spent = Number(m.spent.toFixed(2));
    });

    const topDay = Object.entries(daysMap).reduce(
      (best, [day, count]) => (count > best.count ? { day, count } : best),
      { day: 'Friday', count: 0 }
    ).day;

    const topTimeSlot = Object.entries(hoursMap).reduce(
      (best, [slot, count]) => (count > best.count ? { slot, count } : best),
      { slot: 'Dinner', count: 0 }
    ).slot;

    const topPayment = Object.entries(paymentMap).reduce(
      (best, [method, count]) => (count > best.count ? { method, count } : best),
      { method: 'Bakong KHQR', count: 0 }
    ).method;

    const validOrderCount = deliveredCount + pendingCount;
    const averageOrderValue = validOrderCount > 0 ? Number((totalSpent / validOrderCount).toFixed(2)) : 0;

    return {
      totalSpent: Number(totalSpent.toFixed(2)),
      totalSavings: Number(totalSavings.toFixed(2)),
      totalOrders: orders.length,
      deliveredCount,
      pendingCount,
      cancelledCount,
      averageOrderValue,
      monthlySpending,
      topDishes,
      habits: {
        topDay,
        topTimeSlot,
        preferredPayment: topPayment === 'bakong_khqr' ? 'Bakong KHQR' : 'Cash on Delivery',
      },
    };
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

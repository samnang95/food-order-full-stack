import type { OrderEntity, OrderStatus } from '../../../domain/orders/entities/order_entity';
import type { OrderRepository } from '../../../domain/orders/repositories/order_repository';
import { OrderModel, type OrderModelData } from '../models/order_model';
import { mockOrdersData } from '../datasources/orders_mock_data';
import { indexedDBService, DB_STORES } from '../../../core/db';
import { apiClient } from '../../../core/services/api_client';

export function mapApiOrderToModel(raw: any): OrderModelData {
  const rawId = (raw._id || raw.id || '').toString();
  const rawStatus = (raw.status || 'pending').toLowerCase();
  let status: OrderStatus = 'pending';
  if (rawStatus === 'out_for_delivery' || rawStatus === 'on_delivery') {
    status = 'on_delivery';
  } else if (['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].includes(rawStatus)) {
    status = rawStatus as OrderStatus;
  }

  const items = (raw.items || []).map((it: any, idx: number) => {
    const food = it.food && typeof it.food === 'object' ? it.food : null;
    return {
      id: (it._id || `item_${idx}`).toString(),
      foodId: (food?._id || it.food || `food_${idx}`).toString(),
      name: food?.name || it.name || 'Food Item',
      price: Number(it.price || food?.price || 0),
      quantity: Number(it.quantity || 1),
      image: food?.imageUrl || it.image || undefined,
      specialInstructions: it.specialInstructions || '',
    };
  });

  const rawPayment = (raw.paymentMethod || 'cash').toLowerCase();
  const paymentMethod: 'card' | 'cash' | 'digital_wallet' =
    rawPayment === 'card' ? 'card' : rawPayment === 'digital_wallet' || rawPayment === 'khqr' ? 'digital_wallet' : 'cash';

  const rawPayStatus = (raw.paymentStatus || 'pending').toLowerCase();
  const paymentStatus: 'paid' | 'pending' | 'failed' =
    rawPayStatus === 'completed' || rawPayStatus === 'paid' ? 'paid' : rawPayStatus === 'failed' ? 'failed' : 'pending';

  return {
    id: rawId,
    orderNumber: raw.orderNumber || `ORD-${rawId.slice(-4).toUpperCase()}`,
    customerName: raw.user?.username || raw.customerName || 'Customer',
    customerPhone: raw.user?.phone || raw.customerPhone || '+855 12 345 678',
    customerAddress: raw.deliveryAddress || raw.customerAddress || 'Phnom Penh, Cambodia',
    items,
    subtotal: Number(raw.totalAmount || raw.subtotal || 0),
    deliveryFee: Number(raw.deliveryFee || 2.5),
    driverTip: Number(raw.driverTip || 0),
    discount: Number(raw.discountAmount || raw.discount || 0),
    total: Number(raw.totalAmount || raw.total || 0),
    paymentMethod,
    paymentStatus,
    status,
    createdAt: raw.createdAt || new Date().toISOString(),
    estimatedDeliveryMinutes: Number(raw.estimatedDeliveryMinutes || (status === 'delivered' ? 0 : 30)),
    notes: raw.deliveryNotes || raw.notes || '',
  };
}

export class OrderRepositoryImpl implements OrderRepository {
  private localOrders: OrderModelData[] = [];
  private isInitialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stored = await indexedDBService.getAll<OrderModelData>(DB_STORES.ORDERS);
      if (stored && stored.length > 0) {
        this.localOrders = stored;
      } else {
        this.localOrders = [...mockOrdersData];
        await indexedDBService.putAll(DB_STORES.ORDERS, this.localOrders);
      }
    } catch {
      this.localOrders = [...mockOrdersData];
    }
    this.isInitialized = true;
  }

  async getOrders(): Promise<OrderEntity[]> {
    await this.ensureInitialized();

    try {
      const res = await apiClient.get('/orders');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const fetched = res.data.map(mapApiOrderToModel);
        // Merge fetched orders with local orders (preserving unique IDs)
        const orderMap = new Map<string, OrderModelData>();
        this.localOrders.forEach(o => orderMap.set(o.id, o));
        fetched.forEach(o => orderMap.set(o.id, o));
        this.localOrders = Array.from(orderMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        await indexedDBService.putAll(DB_STORES.ORDERS, this.localOrders);
      }
    } catch (err) {
      console.warn('⚠️ [OrderRepository] Failed to fetch orders from backend, using local/cache:', err);
    }

    return this.localOrders.map((m) => OrderModel.toEntity(m));
  }

  async getOrderById(id: string): Promise<OrderEntity | null> {
    await this.ensureInitialized();
    const found = this.localOrders.find((o) => o.id === id);
    if (found) return OrderModel.toEntity(found);

    try {
      const res = await apiClient.get(`/orders/${id}`);
      if (res.data) {
        const mapped = mapApiOrderToModel(res.data);
        this.localOrders.unshift(mapped);
        await indexedDBService.put(DB_STORES.ORDERS, mapped);
        return OrderModel.toEntity(mapped);
      }
    } catch (_) {}

    return null;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderEntity> {
    await this.ensureInitialized();
    let item = this.localOrders.find((o) => o.id === id);
    if (!item) {
      item = {
        id,
        orderNumber: `ORD-${id.slice(-4).toUpperCase()}`,
        customerName: 'Customer',
        customerPhone: '+855 12 345 678',
        customerAddress: 'Phnom Penh, Cambodia',
        items: [],
        subtotal: 0,
        deliveryFee: 2.5,
        driverTip: 0,
        discount: 0,
        total: 0,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        status,
        createdAt: new Date().toISOString(),
        estimatedDeliveryMinutes: status === 'delivered' ? 0 : 30,
      };
      this.localOrders.unshift(item);
    }

    item.status = status;
    if (status === 'delivered') {
      item.estimatedDeliveryMinutes = 0;
      item.paymentStatus = 'paid';
    }

    // Persist to local IndexedDB
    await indexedDBService.put(DB_STORES.ORDERS, item);

    // Sync with remote API
    try {
      const apiStatus = status === 'on_delivery' ? 'out_for_delivery' : status;
      await apiClient.put(`/orders/${id}/status`, {
        status: apiStatus,
        paymentStatus: item.paymentStatus === 'paid' ? 'completed' : 'pending',
      });
    } catch (err) {
      console.warn(`⚠️ [OrderRepository] Could not sync order status for ${id} with API:`, err);
    }

    return OrderModel.toEntity(item);
  }

  upsertOrder(rawOrder: any): OrderEntity {
    const mapped = mapApiOrderToModel(rawOrder);
    const idx = this.localOrders.findIndex((o) => o.id === mapped.id);
    if (idx !== -1) {
      this.localOrders[idx] = mapped;
    } else {
      this.localOrders.unshift(mapped);
    }
    indexedDBService.put(DB_STORES.ORDERS, mapped).catch(() => {});
    return OrderModel.toEntity(mapped);
  }
}

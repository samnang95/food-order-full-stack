import { LocalDB } from '../../../core';
import { TrackingModel } from '../models/tracking_model';
import { DeliveryTrackingEntity, TrackingTimelineEvent } from '../../../domain/delivery_tracking';

const DB_KEY = 'bitecraft_delivery_tracking';

// Simulated Phnom Penh driver profiles
const MOCK_DRIVERS = [
  {
    name: 'Sok Dara',
    phone: '+85512889900',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    rating: 4.95,
    vehiclePlate: '1AB-2345',
    vehicleType: 'Honda Scoopy',
  },
  {
    name: 'Chea Vanny',
    phone: '+85516772233',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120',
    rating: 4.88,
    vehiclePlate: '2CD-6789',
    vehicleType: 'Yamaha NMAX',
  },
  {
    name: 'Sovann Rith',
    phone: '+85510556677',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
    rating: 4.92,
    vehiclePlate: '3EF-0123',
    vehicleType: 'Honda PCX',
  },
];

// BiteCraft restaurant location (BKK1 area)
const RESTAURANT_COORDS = { lat: 11.5564, lng: 104.9282 };

// Simulated delivery destinations in Phnom Penh
const DELIVERY_DESTINATIONS = [
  { lat: 11.5510, lng: 104.9250, name: 'BKK1' },
  { lat: 11.5720, lng: 104.9250, name: 'Daun Penh' },
  { lat: 11.5380, lng: 104.9200, name: 'Chamkarmon' },
  { lat: 11.5780, lng: 104.8950, name: 'Toul Kork' },
  { lat: 11.5380, lng: 104.9120, name: 'Tuol Tom Poung' },
];

/**
 * Tracking Local Data Source
 * Simulates real-time delivery tracking with local storage persistence
 * and mock driver movement simulation.
 */
export class TrackingLocalDataSource {
  constructor() {
    this._sessions = this._loadFromStorage();
  }

  _loadFromStorage() {
    try {
      const raw = LocalDB.getJSON(DB_KEY, []);
      return Array.isArray(raw) ? raw.map((r) => TrackingModel.fromJson(r)) : [];
    } catch {
      return [];
    }
  }

  _saveToStorage() {
    LocalDB.setJSON(
      DB_KEY,
      this._sessions.map((s) => TrackingModel.toJson(s))
    );
  }

  /**
   * Create or retrieve a tracking session for an order.
   * Assigns a random mock driver and simulates ETA/location.
   */
  getOrCreateSession(orderId, orderData = {}) {
    let session = this._sessions.find((s) => s.orderId === orderId);

    if (!session) {
      const driver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
      const dest =
        DELIVERY_DESTINATIONS[Math.floor(Math.random() * DELIVERY_DESTINATIONS.length)];

      const status = (orderData.status || 'pending').toLowerCase();

      // Build timeline based on current status
      const timeline = this._buildTimeline(status);

      // Simulate driver position between restaurant and destination
      const progress = this._getStatusProgress(status);
      const driverLat =
        RESTAURANT_COORDS.lat + (dest.lat - RESTAURANT_COORDS.lat) * progress;
      const driverLng =
        RESTAURANT_COORDS.lng + (dest.lng - RESTAURANT_COORDS.lng) * progress;

      const distanceKm = this._haversine(driverLat, driverLng, dest.lat, dest.lng);
      const estimatedMinutes = Math.max(1, Math.round(distanceKm * 4.5 + 5));

      session = new DeliveryTrackingEntity({
        orderId,
        status,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverAvatar: driver.avatar,
        driverRating: driver.rating,
        vehiclePlate: driver.vehiclePlate,
        vehicleType: driver.vehicleType,
        driverLat,
        driverLng,
        restaurantLat: RESTAURANT_COORDS.lat,
        restaurantLng: RESTAURANT_COORDS.lng,
        deliveryLat: dest.lat,
        deliveryLng: dest.lng,
        estimatedMinutes,
        distanceKm: Math.round(distanceKm * 10) / 10,
        timeline,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this._sessions.push(session);
      this._saveToStorage();
    }

    return session;
  }

  getByOrderId(orderId) {
    return this._sessions.find((s) => s.orderId === orderId) || null;
  }

  getActiveDeliveries() {
    return this._sessions.filter((s) => s.isLive);
  }

  updateDriverLocation(orderId, { lat, lng }) {
    const session = this._sessions.find((s) => s.orderId === orderId);
    if (!session) return null;

    session.driverLat = lat;
    session.driverLng = lng;

    // Recalculate ETA
    if (session.deliveryLat && session.deliveryLng) {
      const dist = this._haversine(lat, lng, session.deliveryLat, session.deliveryLng);
      session.distanceKm = Math.round(dist * 10) / 10;
      session.estimatedMinutes = Math.max(1, Math.round(dist * 4.5 + 2));
    }

    session.updatedAt = new Date();
    this._saveToStorage();
    return session;
  }

  updateStatus(orderId, newStatus) {
    const session = this._sessions.find((s) => s.orderId === orderId);
    if (!session) return null;

    session.status = newStatus;
    session.timeline = this._buildTimeline(newStatus);
    session.updatedAt = new Date();

    // Update driver position based on status
    if (session.deliveryLat && session.deliveryLng) {
      const progress = this._getStatusProgress(newStatus);
      session.driverLat =
        session.restaurantLat + (session.deliveryLat - session.restaurantLat) * progress;
      session.driverLng =
        session.restaurantLng + (session.deliveryLng - session.restaurantLng) * progress;

      const dist = this._haversine(
        session.driverLat,
        session.driverLng,
        session.deliveryLat,
        session.deliveryLng
      );
      session.distanceKm = Math.round(dist * 10) / 10;
      session.estimatedMinutes =
        newStatus === 'delivered' ? 0 : Math.max(1, Math.round(dist * 4.5 + 2));
    }

    this._saveToStorage();
    return session;
  }

  _buildTimeline(currentStatus) {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: '📝' },
      { key: 'confirmed', label: 'Restaurant Confirmed', icon: '✅' },
      { key: 'preparing', label: 'Preparing Food', icon: '🍳' },
      { key: 'ready', label: 'Ready for Pickup', icon: '📦' },
      { key: 'picked_up', label: 'Driver Picked Up', icon: '🛵' },
      { key: 'out_for_delivery', label: 'On the Way', icon: '🏍️' },
      { key: 'nearby', label: 'Almost There', icon: '📍' },
      { key: 'delivered', label: 'Delivered', icon: '🎉' },
    ];

    const currentIdx = steps.findIndex((s) => s.key === currentStatus);
    const idx = currentIdx >= 0 ? currentIdx : 0;

    return steps.map((step, i) =>
      new TrackingTimelineEvent({
        ...step,
        isCompleted: i < idx,
        isCurrent: i === idx,
        timestamp: i <= idx ? new Date(Date.now() - (idx - i) * 5 * 60 * 1000) : null,
      })
    );
  }

  _getStatusProgress(status) {
    const progressMap = {
      pending: 0,
      confirmed: 0.05,
      preparing: 0.1,
      ready: 0.15,
      picked_up: 0.35,
      out_for_delivery: 0.65,
      nearby: 0.9,
      delivered: 1.0,
    };
    return progressMap[status] || 0;
  }

  _haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

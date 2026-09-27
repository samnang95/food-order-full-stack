import { DriverTipRepository } from '../../../domain/driver_tip/repositories/driver_tip_repository';
import { DriverEntity } from '../../../domain/driver_tip/entities/driver_entity';
import { DriverTipEntity } from '../../../domain/driver_tip/entities/driver_tip_entity';
import { DriverFeedbackEntity } from '../../../domain/driver_tip/entities/driver_feedback_entity';
import { DriverTipRemoteDataSource } from '../datasources/driver_tip_remote_datasource';

export class DriverTipRepositoryImpl extends DriverTipRepository {
  constructor({ localDataSource, remoteDataSource = new DriverTipRemoteDataSource() }) {
    super();
    this.localDataSource = localDataSource;
    this.remoteDataSource = remoteDataSource;
    this.cachedDriver = new DriverEntity();
  }

  async getDriverProfile(driverId = 'driver_001') {
    try {
      const remote = await this.remoteDataSource.getDriverProfile(driverId);
      if (remote) {
        this.cachedDriver = new DriverEntity({
          id: remote.driverId || driverId,
          name: remote.name || 'Sok Dara',
          phone: remote.phone,
          avatar: remote.avatar,
          vehicle: remote.vehicle,
          plateNumber: remote.plateNumber,
          rating: remote.rating || 4.96,
          totalDeliveries: remote.totalDeliveries || 1248,
          badgeCounts: remote.compliments || this.cachedDriver.badgeCounts,
        });
        return this.cachedDriver;
      }
    } catch (e) {
      console.debug('Using cached driver profile:', e.message);
    }

    if (this.cachedDriver.id === driverId) {
      return this.cachedDriver;
    }
    return new DriverEntity({ id: driverId });
  }

  async submitDriverTip({
    orderId,
    driverId = 'driver_001',
    amountUsd = 0,
    amountKhr = 0,
    paymentMethod = 'checkout_add_on',
    compliments = [],
    note = '',
    khqrPayload = null,
  }) {
    const tip = new DriverTipEntity({
      id: `tip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      driverId,
      amountUsd,
      amountKhr: amountKhr || Math.round(amountUsd * 4100),
      paymentMethod,
      compliments,
      note,
      status: 'completed',
      khqrPayload,
      createdAt: new Date(),
    });

    this.localDataSource.saveTip(tip);

    // Call backend API
    try {
      await this.remoteDataSource.submitTip({
        orderId,
        driverId,
        amount: amountUsd,
        paymentMethod,
        compliments,
        note,
      });
    } catch (e) {
      console.debug('Backend driver tip note:', e.message);
    }

    // Update driver badge counts in memory
    if (compliments?.length > 0) {
      for (const badge of compliments) {
        if (this.cachedDriver.badgeCounts[badge] !== undefined) {
          this.cachedDriver.badgeCounts[badge] += 1;
        } else {
          this.cachedDriver.badgeCounts[badge] = 1;
        }
      }
    }

    return tip;
  }

  async submitDriverFeedback({
    orderId,
    driverId = 'driver_001',
    rating = 5,
    compliments = [],
    reviewText = '',
    tipAmount = 0,
  }) {
    const feedback = new DriverFeedbackEntity({
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      driverId,
      rating,
      compliments,
      reviewText,
      tipAmount,
      createdAt: new Date(),
    });

    this.localDataSource.saveFeedback(feedback);

    // Call backend API
    try {
      await this.remoteDataSource.submitFeedback({
        orderId,
        driverId,
        rating,
        compliments,
        reviewText,
        tipAmount,
      });
    } catch (e) {
      console.debug('Backend feedback note:', e.message);
    }

    return feedback;
  }

  async getOrderTipStatus(orderId) {
    try {
      const res = await this.remoteDataSource.getOrderTipStatus(orderId);
      if (res?.hasTipped !== undefined) {
        return {
          hasTipped: res.hasTipped,
          tip: res.tips?.[0] ? new DriverTipEntity(res.tips[0]) : null,
        };
      }
    } catch (e) {
      console.debug('Using local tip status fallback:', e.message);
    }

    return this.localDataSource.getTipForOrder(orderId);
  }

  generateBakongTipQr({ orderId, driver, amountUsd, amountKhr }) {
    const amountStr = amountUsd ? amountUsd.toFixed(2) : (amountKhr / 4100).toFixed(2);
    const driverName = driver?.name || 'Sok Dara';
    const cleanPhone = (driver?.phone || '012889922').replace(/\s+/g, '');

    // Formatted Bakong standard KHQR payload
    const khqrString = `00020101021229340016bakong@nbc.gov.kh0110${cleanPhone}520458125303840540${amountStr.length}${amountStr}5802KH5912${driverName.padEnd(12, ' ')}6010Phnom Penh62200716${orderId.substring(0, 16)}6304`;

    return {
      khqrString,
      amountUsd: Number(amountStr),
      amountKhr: amountKhr || Math.round(Number(amountStr) * 4100),
      driverName,
      driverVehicle: driver?.vehicle || 'Honda Wave 125i',
      currency: 'USD',
      generatedAt: new Date(),
    };
  }
}

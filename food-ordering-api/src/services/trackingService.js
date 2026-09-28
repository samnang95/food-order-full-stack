const DeliveryTracking = require('../models/deliveryTrackingModel');
const Order = require('../models/orderModel');

const STEPS = [
  { key: 'confirmed', title: 'Order Confirmed', description: 'Restaurant has accepted your order' },
  { key: 'preparing', title: 'Kitchen Preparing', description: 'Chef is handcrafting your dishes' },
  { key: 'ready_for_pickup', title: 'Food Ready', description: 'Packed hot and waiting for driver pickup' },
  { key: 'driver_assigned', title: 'Rider Assigned', description: 'Sok Dara is heading to the kitchen' },
  { key: 'picked_up', title: 'Order Picked Up', description: 'Rider has secured the thermal delivery bag' },
  { key: 'out_for_delivery', title: 'On the Way', description: 'Navigating through Phnom Penh to your address' },
  { key: 'arriving', title: 'Arriving Soon', description: 'Rider is within 500 meters of your doorstep' },
  { key: 'delivered', title: 'Delivered', description: 'Package safely delivered. Enjoy your meal!' },
];

function generateTimeline(currentStepIndex = 5) {
  const now = new Date();
  return STEPS.map((step, idx) => {
    const eventTime = new Date(now.getTime() - (currentStepIndex - idx) * 4 * 60000);
    const timeStr = eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      title: step.title,
      description: step.description,
      time: idx <= currentStepIndex ? timeStr : '--:--',
      completed: idx < currentStepIndex,
      current: idx === currentStepIndex,
    };
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

class TrackingService {
  async getOrCreateSession(orderId) {
    let session = await DeliveryTracking.findOne({ orderId });

    if (!session) {
      // Look up associated order to grab real delivery addresses/coords if available
      let deliveryLocation = { lat: 11.5510, lng: 104.9250 };
      let restaurantLocation = { lat: 11.5564, lng: 104.9282 };

      try {
        const order = await Order.findById(orderId);
        if (order) {
          if (order.deliveryLocation?.lat && order.deliveryLocation?.lng) {
            deliveryLocation = order.deliveryLocation;
          }
          if (order.restaurantLocation?.lat && order.restaurantLocation?.lng) {
            restaurantLocation = order.restaurantLocation;
          }
        }
      } catch {
        // Fallback for mock/non-mongo order IDs
      }

      const driverLocation = {
        lat: (restaurantLocation.lat + deliveryLocation.lat) / 2 + 0.001,
        lng: (restaurantLocation.lng + deliveryLocation.lng) / 2 + 0.001,
      };

      const distanceKm = calculateDistance(
        driverLocation.lat,
        driverLocation.lng,
        deliveryLocation.lat,
        deliveryLocation.lng
      );
      const estimatedMinutes = Math.max(3, Math.round(distanceKm * 4.5));

      session = await DeliveryTracking.create({
        orderId,
        status: 'out_for_delivery',
        stepIndex: 5,
        estimatedMinutes,
        distanceKm,
        driver: {
          name: 'Sok Dara',
          phone: '+855 12 889 900',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
          vehicleType: 'Honda Wave 125i',
          vehiclePlate: 'PP-1BC-8899',
          rating: 4.9,
        },
        driverLocation,
        restaurantLocation,
        deliveryLocation,
        timeline: generateTimeline(5),
      });
    }

    return session;
  }

  async updateDriverLocation(orderId, location) {
    const session = await this.getOrCreateSession(orderId);

    session.driverLocation = location;

    if (session.deliveryLocation?.lat && session.deliveryLocation?.lng) {
      session.distanceKm = calculateDistance(
        location.lat,
        location.lng,
        session.deliveryLocation.lat,
        session.deliveryLocation.lng
      );
      session.estimatedMinutes = Math.max(1, Math.round(session.distanceKm * 4.5));

      if (session.distanceKm < 0.3 && session.stepIndex === 5) {
        session.status = 'arriving';
        session.stepIndex = 6;
        session.timeline = generateTimeline(6);
      }
    }

    await session.save();
    return session;
  }

  async updateTrackingStatus(orderId, status) {
    const session = await this.getOrCreateSession(orderId);
    session.status = status;

    const stepIdx = STEPS.findIndex((s) => s.key === status);
    if (stepIdx !== -1) {
      session.stepIndex = stepIdx;
      session.timeline = generateTimeline(stepIdx);
    }

    await session.save();
    return session;
  }
}

module.exports = new TrackingService();

const { getIO } = require('./socketManager');

// Active simulations: Map<orderId, intervalId>
const activeSimulations = new Map();

/**
 * Phnom Penh restaurant locations (simulated)
 */
const RESTAURANT_LOCATIONS = [
  { lat: 11.5564, lng: 104.9282 }, // Near Central Market
  { lat: 11.5725, lng: 104.9200 }, // Near Toul Tom Poung
  { lat: 11.5494, lng: 104.9339 }, // Near Riverside
  { lat: 11.5684, lng: 104.8910 }, // Near Russian Market
  { lat: 11.5855, lng: 104.9010 }, // Near BKK area
];

/**
 * Generate waypoints between two coordinates
 * Adds slight random offsets to simulate real road movement
 */
const generateWaypoints = (start, end, numPoints = 20) => {
  const waypoints = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Add slight random offset to simulate road curves
    const jitterLat = (Math.random() - 0.5) * 0.001;
    const jitterLng = (Math.random() - 0.5) * 0.001;
    waypoints.push({
      lat: start.lat + (end.lat - start.lat) * t + (i > 0 && i < numPoints ? jitterLat : 0),
      lng: start.lng + (end.lng - start.lng) * t + (i > 0 && i < numPoints ? jitterLng : 0),
    });
  }
  return waypoints;
};

/**
 * Calculate heading (bearing) between two points in degrees
 */
const calculateHeading = (from, to) => {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

/**
 * Start simulating driver movement for an order
 * @param {string} orderId - The order ID
 * @param {Object} deliveryLocation - { lat, lng } of the delivery destination
 * @param {Function} onDelivered - Callback when driver arrives at destination
 */
const startSimulation = (orderId, deliveryLocation, onDelivered) => {
  // Stop any existing simulation for this order
  stopSimulation(orderId);

  let io;
  try {
    io = getIO();
  } catch (_) {
    console.warn(`⚠️ [Driver] Cannot start simulation for order ${orderId}: Socket.IO not initialized`);
    return;
  }
  const restaurant = RESTAURANT_LOCATIONS[Math.floor(Math.random() * RESTAURANT_LOCATIONS.length)];
  const waypoints = generateWaypoints(restaurant, deliveryLocation, 20);
  let currentIndex = 0;
  const totalSteps = waypoints.length;

  console.log(`🚗 [Driver] Simulation started for order ${orderId}`);
  console.log(`   📍 Restaurant: (${restaurant.lat.toFixed(4)}, ${restaurant.lng.toFixed(4)})`);
  console.log(`   🏠 Delivery:   (${deliveryLocation.lat.toFixed(4)}, ${deliveryLocation.lng.toFixed(4)})`);

  // Emit initial position immediately
  io.to(`order_${orderId}`).emit('driver_location', {
    orderId,
    lat: waypoints[0].lat,
    lng: waypoints[0].lng,
    heading: calculateHeading(waypoints[0], waypoints[1]),
    eta: Math.ceil((totalSteps - currentIndex) * 3 / 60), // minutes
    restaurantLat: restaurant.lat,
    restaurantLng: restaurant.lng,
    deliveryLat: deliveryLocation.lat,
    deliveryLng: deliveryLocation.lng,
    progress: 0,
  });

  // Move driver every 3 seconds
  const intervalId = setInterval(() => {
    currentIndex++;

    if (currentIndex >= totalSteps) {
      // Driver arrived at destination
      clearInterval(intervalId);
      activeSimulations.delete(orderId);

      io.to(`order_${orderId}`).emit('driver_location', {
        orderId,
        lat: deliveryLocation.lat,
        lng: deliveryLocation.lng,
        heading: 0,
        eta: 0,
        restaurantLat: restaurant.lat,
        restaurantLng: restaurant.lng,
        deliveryLat: deliveryLocation.lat,
        deliveryLng: deliveryLocation.lng,
        progress: 1,
      });

      io.to(`order_${orderId}`).emit('order_status_changed', {
        orderId,
        status: 'delivered',
      });

      io.to(`order_${orderId}`).emit('push_notification', {
        id: `notif_${Date.now()}`,
        type: 'delivery',
        title: '🎉 Order Delivered!',
        body: 'Your food has arrived at your address. Enjoy your meal!',
        orderId,
        timestamp: new Date().toISOString(),
        isRead: false,
      });

      console.log(`✅ [Driver] Order ${orderId} delivered!`);

      if (onDelivered) {
        onDelivered();
      }
      return;
    }

    const current = waypoints[currentIndex];
    const next = waypoints[Math.min(currentIndex + 1, totalSteps - 1)];
    const heading = calculateHeading(current, next);
    const remainingSteps = totalSteps - currentIndex;
    const eta = Math.ceil((remainingSteps * 3) / 60); // minutes

    // When driver is approximately 2 minutes away, send push notification
    if (currentIndex === Math.floor(totalSteps * 0.7)) {
      io.to(`order_${orderId}`).emit('push_notification', {
        id: `notif_${Date.now()}`,
        type: 'order',
        title: '🛵 Driver is Almost There!',
        body: 'Rider Sok Dara is 2 minutes away. Please prepare to receive your order!',
        orderId,
        timestamp: new Date().toISOString(),
        isRead: false,
      });
    }

    io.to(`order_${orderId}`).emit('driver_location', {
      orderId,
      lat: current.lat,
      lng: current.lng,
      heading,
      eta,
      restaurantLat: restaurant.lat,
      restaurantLng: restaurant.lng,
      deliveryLat: deliveryLocation.lat,
      deliveryLng: deliveryLocation.lng,
      progress: currentIndex / totalSteps,
    });
  }, 3000);

  activeSimulations.set(orderId, intervalId);
};

/**
 * Stop an active driver simulation
 */
const stopSimulation = (orderId) => {
  const intervalId = activeSimulations.get(orderId);
  if (intervalId) {
    clearInterval(intervalId);
    activeSimulations.delete(orderId);
    console.log(`🛑 [Driver] Simulation stopped for order ${orderId}`);
  }
};

module.exports = { startSimulation, stopSimulation };

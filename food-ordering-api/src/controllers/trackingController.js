const trackingService = require('../services/trackingService');
const { getIO } = require('../socket/socketManager');

const getTrackingSession = async (req, res) => {
  try {
    const { orderId } = req.params;
    const session = await trackingService.getOrCreateSession(orderId);
    res.json({ success: true, tracking: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDriverLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { location, heading, speed } = req.body;

    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(400).json({ success: false, message: 'Invalid location object with lat and lng' });
    }

    const session = await trackingService.updateDriverLocation(orderId, location);

    // Broadcast live location update to socket room
    try {
      const io = getIO();
      const payload = {
        orderId,
        location: session.driverLocation,
        heading: heading || 0,
        speed: speed || 28,
        estimatedMinutes: session.estimatedMinutes,
        distanceKm: session.distanceKm,
        status: session.status,
        timestamp: new Date().toISOString(),
      };
      io.to(`order_${orderId}`).emit('tracking:location_update', payload);
      io.to(`order_${orderId}`).emit('driver_location', payload);
    } catch (socketErr) {
      console.warn('Socket broadcast skipped:', socketErr.message);
    }

    res.json({ success: true, tracking: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateTrackingStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const session = await trackingService.updateTrackingStatus(orderId, status);

    // Broadcast status change to socket room
    try {
      const io = getIO();
      const payload = {
        orderId,
        status: session.status,
        stepIndex: session.stepIndex,
        timeline: session.timeline,
        timestamp: new Date().toISOString(),
      };
      io.to(`order_${orderId}`).emit('tracking:status_update', payload);
      io.to(`order_${orderId}`).emit('order_status_changed', payload);
    } catch (socketErr) {
      console.warn('Socket broadcast skipped:', socketErr.message);
    }

    res.json({ success: true, tracking: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTrackingSession,
  updateDriverLocation,
  updateTrackingStatus,
};

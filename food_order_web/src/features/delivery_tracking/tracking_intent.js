/**
 * DeliveryTracking Intent (MVI Intent)
 */
export const TrackingIntentType = {
  LOAD_TRACKING: 'TRACKING/LOAD_TRACKING',
  LOAD_START: 'TRACKING/LOAD_START',
  LOAD_SUCCESS: 'TRACKING/LOAD_SUCCESS',
  LOAD_ERROR: 'TRACKING/LOAD_ERROR',

  LOAD_ACTIVE_DELIVERIES: 'TRACKING/LOAD_ACTIVE_DELIVERIES',
  ACTIVE_DELIVERIES_LOADED: 'TRACKING/ACTIVE_DELIVERIES_LOADED',

  UPDATE_DRIVER_LOCATION: 'TRACKING/UPDATE_DRIVER_LOCATION',
  DRIVER_LOCATION_UPDATED: 'TRACKING/DRIVER_LOCATION_UPDATED',

  UPDATE_STATUS: 'TRACKING/UPDATE_STATUS',
  STATUS_UPDATED: 'TRACKING/STATUS_UPDATED',

  TOGGLE_MAP: 'TRACKING/TOGGLE_MAP',
  SIMULATION_TICK: 'TRACKING/SIMULATION_TICK',
  CLEAR_TRACKING: 'TRACKING/CLEAR_TRACKING',
};

export const TrackingIntent = {
  loadTracking: (orderId) => ({
    type: TrackingIntentType.LOAD_TRACKING,
    payload: orderId,
  }),

  loadActiveDeliveries: () => ({
    type: TrackingIntentType.LOAD_ACTIVE_DELIVERIES,
  }),

  updateDriverLocation: (orderId, location) => ({
    type: TrackingIntentType.UPDATE_DRIVER_LOCATION,
    payload: { orderId, location },
  }),

  updateStatus: (orderId, newStatus) => ({
    type: TrackingIntentType.UPDATE_STATUS,
    payload: { orderId, newStatus },
  }),

  toggleMap: () => ({
    type: TrackingIntentType.TOGGLE_MAP,
  }),

  simulationTick: (tracking) => ({
    type: TrackingIntentType.SIMULATION_TICK,
    payload: tracking,
  }),

  clearTracking: () => ({
    type: TrackingIntentType.CLEAR_TRACKING,
  }),
};

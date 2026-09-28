/**
 * DeliveryTracking State (MVI Model)
 */
export const createInitialTrackingState = () => ({
  /** @type {import('../../domain/delivery_tracking').DeliveryTrackingEntity|null} */
  activeTracking: null,
  /** @type {import('../../domain/delivery_tracking').DeliveryTrackingEntity[]} */
  activeDeliveries: [],
  isLoading: false,
  errorMessage: null,
  /** Whether the live map is expanded */
  isMapExpanded: false,
  /** Simulation tick counter */
  simulationTick: 0,
});

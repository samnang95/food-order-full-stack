import { DriverEntity } from '../../domain/driver_tip/entities/driver_entity';

export const initialDriverTipState = {
  driver: new DriverEntity(),
  tipAmount: 1.0, // default friendly tip
  customTipValue: '',
  isCustomActive: false,
  selectedCompliments: ['friendly_smile', 'super_fast'],
  rating: 5,
  reviewText: '',
  activeOrderId: null,
  isRatingModalOpen: false,
  isKhqrTipModalOpen: false,
  bakongPayload: null,
  isLoading: false,
  tipSubmitted: false,
  recentTip: null,
  error: null,
};

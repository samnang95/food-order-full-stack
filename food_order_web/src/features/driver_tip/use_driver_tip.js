import { useContext } from 'react';
import { DriverTipContext } from './driver_tip_context';

export function useDriverTip() {
  const context = useContext(DriverTipContext);
  if (!context) {
    throw new Error('useDriverTip must be used within a DriverTipProvider');
  }
  return context;
}

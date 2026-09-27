import PropTypes from 'prop-types';
import { DriverTipContext } from './driver_tip_context';
import { useDriverTipStore } from './driver_tip_store';
import { DriverRatingModal } from './components/DriverRatingModal';
import { BakongTipQrModal } from './components/BakongTipQrModal';

export function DriverTipProvider({ children }) {
  const store = useDriverTipStore();

  return (
    <DriverTipContext.Provider value={store}>
      {children}
      <DriverRatingModal />
      <BakongTipQrModal />
    </DriverTipContext.Provider>
  );
}

DriverTipProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

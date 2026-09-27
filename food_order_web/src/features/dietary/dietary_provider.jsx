import PropTypes from 'prop-types';
import { DietaryContext } from './dietary_context';
import { useDietaryStore } from './dietary_store';

import { DietaryPreferencesModal } from './components/DietaryPreferencesModal';

export function DietaryProvider({ children }) {
  const store = useDietaryStore();

  return (
    <DietaryContext.Provider value={store}>
      {children}
      <DietaryPreferencesModal />
    </DietaryContext.Provider>
  );
}

DietaryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

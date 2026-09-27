import PropTypes from 'prop-types';
import { RewardsContext } from './rewards_context';
import { useRewardsStore } from './rewards_store';
import { RewardsHubModal } from './components/RewardsHubModal';

export function RewardsProvider({ children }) {
  const store = useRewardsStore();

  return (
    <RewardsContext.Provider value={store}>
      {children}
      <RewardsHubModal />
    </RewardsContext.Provider>
  );
}

RewardsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};


import PropTypes from 'prop-types';
import { NotificationsContext } from './notifications_context';
import { useNotificationsStore } from './notifications_store';

export function NotificationsProvider({ children }) {
  const store = useNotificationsStore();

  return <NotificationsContext.Provider value={store}>{children}</NotificationsContext.Provider>;
}

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

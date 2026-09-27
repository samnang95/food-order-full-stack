import PropTypes from 'prop-types';
import { FavoritesContext } from './favorites_context';
import { useFavoritesStore } from './favorites_store';

export function FavoritesProvider({ children }) {
  const store = useFavoritesStore();

  return <FavoritesContext.Provider value={store}>{children}</FavoritesContext.Provider>;
}

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

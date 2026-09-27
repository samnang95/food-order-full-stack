import PropTypes from 'prop-types';
import { CartContext } from './cart_context';
import { useCartStore } from './cart_store';

export function CartProvider({ children }) {
  const store = useCartStore();

  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

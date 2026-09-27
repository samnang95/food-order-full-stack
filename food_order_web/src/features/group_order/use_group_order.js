import { useContext } from 'react';
import { GroupOrderContext } from './group_order_context';

export function useGroupOrder() {
  const context = useContext(GroupOrderContext);
  if (!context) {
    throw new Error('useGroupOrder must be used within a GroupOrderProvider');
  }
  return context;
}

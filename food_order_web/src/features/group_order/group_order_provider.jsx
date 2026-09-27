import { GroupOrderContext } from './group_order_context';
import { useGroupOrderStore } from './group_order_store';
import { GroupOrderBanner } from './components/GroupOrderBanner';
import { GroupOrderModal } from './components/GroupOrderModal';
import { SplitBillModal } from './components/SplitBillModal';

export function GroupOrderProvider({ children }) {
  const store = useGroupOrderStore();

  return (
    <GroupOrderContext.Provider value={store}>
      <GroupOrderBanner />
      {children}
      <GroupOrderModal />
      <SplitBillModal />
    </GroupOrderContext.Provider>
  );
}

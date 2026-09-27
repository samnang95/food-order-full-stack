import { ScheduleContext } from './schedule_context';
import { useScheduleStore } from './schedule_store';
import { ScheduleModal } from './components/ScheduleModal';

export function ScheduleProvider({ children }) {
  const store = useScheduleStore();

  return (
    <ScheduleContext.Provider value={store}>
      {children}
      <ScheduleModal />
    </ScheduleContext.Provider>
  );
}

import { useContext } from 'react';
import { RewardsContext } from './rewards_context';

export function useRewards() {
  const context = useContext(RewardsContext);
  if (!context) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
}

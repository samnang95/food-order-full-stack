import { useContext } from 'react';
import { DietaryContext } from './dietary_context';

export function useDietary() {
  const context = useContext(DietaryContext);
  if (!context) {
    throw new Error('useDietary must be used within a DietaryProvider');
  }
  return context;
}

import type { CustomerEntity } from '../../domain/customers/entities/customer_entity';

/**
 * Model / State (M) in MVI for Customers
 */
export interface CustomersState {
  customers: CustomerEntity[];
  filteredCustomers: CustomerEntity[];
  searchQuery: string;
  isLoading: boolean;
  errorMessage: string | null;
}

export const initialCustomersState: CustomersState = {
  customers: [],
  filteredCustomers: [],
  searchQuery: '',
  isLoading: false,
  errorMessage: null,
};

export function computeFilteredCustomers(
  customers: CustomerEntity[],
  query: string
): CustomerEntity[] {
  if (!query || query.trim() === '') {
    return [...customers];
  }
  const q = query.toLowerCase().trim();
  return customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
  );
}

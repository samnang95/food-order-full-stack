import type { CustomerEntity } from '../entities/customer_entity';

export interface CustomerRepository {
  getCustomers(): Promise<CustomerEntity[]>;
}

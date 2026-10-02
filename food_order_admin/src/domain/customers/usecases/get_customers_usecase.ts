import type { CustomerEntity } from '../entities/customer_entity';
import type { CustomerRepository } from '../repositories/customer_repository';

export class GetCustomersUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(): Promise<CustomerEntity[]> {
    return await this.customerRepository.getCustomers();
  }
}

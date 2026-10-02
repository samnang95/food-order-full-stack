import type { CustomerEntity } from '../../../domain/customers/entities/customer_entity';
import type { CustomerRepository } from '../../../domain/customers/repositories/customer_repository';
import { CustomerModel, type CustomerModelData } from '../models/customer_model';
import { mockCustomersData } from '../datasources/customers_mock_data';

export class CustomerRepositoryImpl implements CustomerRepository {
  private localCustomers: CustomerModelData[] = [...mockCustomersData];

  async getCustomers(): Promise<CustomerEntity[]> {
    return this.localCustomers.map((c) => CustomerModel.toEntity(c));
  }
}

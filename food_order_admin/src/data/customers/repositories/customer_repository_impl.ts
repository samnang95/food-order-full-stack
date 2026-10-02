import type { CustomerEntity } from '../../../domain/customers/entities/customer_entity';
import type { CustomerRepository } from '../../../domain/customers/repositories/customer_repository';
import { CustomerModel, type CustomerModelData } from '../models/customer_model';
import { mockCustomersData } from '../datasources/customers_mock_data';
import { indexedDBService, DB_STORES } from '../../../core/db';

export class CustomerRepositoryImpl implements CustomerRepository {
  private localCustomers: CustomerModelData[] = [];
  private isInitialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stored = await indexedDBService.getAll<CustomerModelData>(DB_STORES.CUSTOMERS);
      if (stored && stored.length > 0) {
        this.localCustomers = stored;
      } else {
        this.localCustomers = [...mockCustomersData];
        await indexedDBService.putAll(DB_STORES.CUSTOMERS, this.localCustomers);
      }
    } catch {
      this.localCustomers = [...mockCustomersData];
    }
    this.isInitialized = true;
  }

  async getCustomers(): Promise<CustomerEntity[]> {
    await this.ensureInitialized();
    return this.localCustomers.map((c) => CustomerModel.toEntity(c));
  }
}

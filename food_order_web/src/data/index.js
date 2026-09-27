import { OrderRepositoryImpl } from './orders/repositories/order_repository_impl';
import { FoodRepositoryImpl } from './foods/repositories/food_repository_impl';
import { VoucherRepositoryImpl } from './vouchers/repositories/voucher_repository_impl';

// Export models & implementations
export * from './orders/models/order_model';
export * from './orders/datasources/order_remote_datasource';
export * from './orders/repositories/order_repository_impl';

export * from './foods/models/food_model';
export * from './foods/datasources/food_remote_datasource';
export * from './foods/repositories/food_repository_impl';

export * from './vouchers/models/voucher_model';
export * from './vouchers/datasources/voucher_remote_datasource';
export * from './vouchers/repositories/voucher_repository_impl';
export * from './reviews';

// Default Singleton Repositories (Service Locator / DI)
export const orderRepository = new OrderRepositoryImpl();
export const foodRepository = new FoodRepositoryImpl();
export const voucherRepository = new VoucherRepositoryImpl();


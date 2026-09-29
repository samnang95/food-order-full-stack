import { OrderRepositoryImpl } from './orders/repositories/order_repository_impl';
import { FoodRepositoryImpl } from './foods/repositories/food_repository_impl';
import { VoucherRepositoryImpl } from './vouchers/repositories/voucher_repository_impl';

import { InvoiceRepositoryImpl } from './invoices/repositories/invoice_repository_impl';
import { DriverChatRepositoryImpl } from './chat/repositories/driver_chat_repository_impl';
import { LoyaltyRepositoryImpl } from './rewards/repositories/loyalty_repository_impl';
import { ScheduleRepositoryImpl } from './schedule/repositories/schedule_repository_impl';
import { GroupOrderRepositoryImpl } from './group_order/repositories/group_order_repository_impl';
import { DietaryRepositoryImpl } from './dietary/repositories/dietary_repository_impl';
import { DietaryLocalDataSource } from './dietary/datasources/dietary_local_datasource';
import { DriverTipRepositoryImpl } from './driver_tip/repositories/driver_tip_repository_impl';
import { DriverTipLocalDataSource } from './driver_tip/datasources/driver_tip_local_datasource';
import { TrackingRepositoryImpl } from './delivery_tracking/repositories/tracking_repository_impl';
import { TrackingLocalDataSource } from './delivery_tracking/datasources/tracking_local_datasource';

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
export * from './invoices';
export * from './chat';
export * from './rewards';
export * from './schedule';
export * from './group_order';
export * from './dietary';
export * from './driver_tip';
export * from './delivery_tracking';
export * from './account';

// Default Singleton Repositories (Service Locator / DI)
export const orderRepository = new OrderRepositoryImpl();
export const foodRepository = new FoodRepositoryImpl();
export const voucherRepository = new VoucherRepositoryImpl();
export const invoiceRepository = new InvoiceRepositoryImpl();
export const driverChatRepository = new DriverChatRepositoryImpl();
export const loyaltyRepository = new LoyaltyRepositoryImpl();
export const scheduleRepository = new ScheduleRepositoryImpl({ foodRepository });
export const groupOrderRepository = new GroupOrderRepositoryImpl();
export const dietaryRepository = new DietaryRepositoryImpl({
  localDataSource: new DietaryLocalDataSource(),
});
export const driverTipRepository = new DriverTipRepositoryImpl({
  localDataSource: new DriverTipLocalDataSource(),
});
export const trackingRepository = new TrackingRepositoryImpl({
  localDataSource: new TrackingLocalDataSource(),
});





import { OrderRepositoryImpl } from './orders/repositories/order_repository_impl';
import { FoodRepositoryImpl } from './foods/repositories/food_repository_impl';
import { CustomerRepositoryImpl } from './customers/repositories/customer_repository_impl';

export * from './orders/models/order_model';
export * from './orders/datasources/orders_mock_data';
export * from './orders/repositories/order_repository_impl';

export * from './foods/models/food_model';
export * from './foods/datasources/foods_mock_data';
export * from './foods/repositories/food_repository_impl';

export * from './customers/models/customer_model';
export * from './customers/datasources/customers_mock_data';
export * from './customers/repositories/customer_repository_impl';

// Default repository instances (singletons)
export const orderRepository = new OrderRepositoryImpl();
export const foodRepository = new FoodRepositoryImpl();
export const customerRepository = new CustomerRepositoryImpl();

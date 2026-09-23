import 'package:get/get.dart';
import '../../data/order/datasources/order_remote_datasource.dart';
import '../../data/order/repositories/order_repository_impl.dart';
import '../../domain/order/repositories/order_repository.dart';
import 'orders_store.dart';

class OrdersBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<OrderRemoteDataSource>()) {
      Get.lazyPut<OrderRemoteDataSource>(() => OrderRemoteDataSourceImpl());
    }
    if (!Get.isRegistered<OrderRepository>()) {
      Get.lazyPut<OrderRepository>(
        () => OrderRepositoryImpl(remoteDataSource: Get.find<OrderRemoteDataSource>()),
      );
    }
    Get.lazyPut<OrdersStore>(
      () => OrdersStore(orderRepository: Get.find<OrderRepository>()),
    );
  }
}

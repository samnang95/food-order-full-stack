import 'package:get/get.dart';
import '../../data/order/datasources/order_remote_datasource.dart';
import '../../data/order/repositories/order_repository_impl.dart';
import '../../domain/order/repositories/order_repository.dart';
import 'checkout_store.dart';

class CheckoutBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<OrderRemoteDataSource>(() => OrderRemoteDataSourceImpl());
    Get.lazyPut<OrderRepository>(
      () => OrderRepositoryImpl(remoteDataSource: Get.find<OrderRemoteDataSource>()),
    );
    Get.lazyPut<CheckoutStore>(
      () => CheckoutStore(orderRepository: Get.find<OrderRepository>()),
    );
  }
}

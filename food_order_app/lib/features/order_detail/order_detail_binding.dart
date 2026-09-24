import 'package:get/get.dart';
import '../../data/order/datasources/order_remote_datasource.dart';
import '../../data/order/repositories/order_repository_impl.dart';
import '../../domain/order/entities/order_entity.dart';
import '../../domain/order/repositories/order_repository.dart';
import 'order_detail_store.dart';

class OrderDetailBinding extends Bindings {
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
    final order = Get.arguments as OrderEntity?;
    if (order != null) {
      Get.lazyPut<OrderDetailStore>(
        () => OrderDetailStore(
          orderRepository: Get.find<OrderRepository>(),
          initialOrder: order,
        ),
      );
    }
  }
}

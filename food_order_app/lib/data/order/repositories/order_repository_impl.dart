import '../../../domain/order/entities/order_entity.dart';
import '../../../domain/order/repositories/order_repository.dart';
import '../datasources/order_remote_datasource.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDataSource remoteDataSource;

  OrderRepositoryImpl({required this.remoteDataSource});

  @override
  Future<OrderEntity> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
    double? deliveryLat,
    double? deliveryLng,
  }) async {
    final model = await remoteDataSource.placeOrder(
      items: items,
      deliveryAddress: deliveryAddress,
      paymentMethod: paymentMethod,
      deliveryLat: deliveryLat,
      deliveryLng: deliveryLng,
    );
    return model.toEntity();
  }

  @override
  Future<List<OrderEntity>> getMyOrders() async {
    final models = await remoteDataSource.getMyOrders();
    return models.map((m) => m.toEntity()).toList();
  }

  @override
  Future<OrderEntity> getOrderById(String orderId) async {
    final model = await remoteDataSource.getOrderById(orderId);
    return model.toEntity();
  }

  @override
  Future<OrderEntity> cancelOrder(String orderId) async {
    final model = await remoteDataSource.cancelOrder(orderId);
    return model.toEntity();
  }
}

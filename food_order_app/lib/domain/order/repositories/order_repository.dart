import '../entities/order_entity.dart';

abstract class OrderRepository {
  Future<OrderEntity> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
  });

  Future<List<OrderEntity>> getMyOrders();

  Future<OrderEntity> getOrderById(String orderId);
}

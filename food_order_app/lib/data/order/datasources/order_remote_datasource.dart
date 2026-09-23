import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../../core/services/api_client.dart';
import '../models/order_model.dart';

abstract class OrderRemoteDataSource {
  Future<OrderModel> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
  });

  Future<List<OrderModel>> getMyOrders();

  Future<OrderModel> getOrderById(String orderId);
}

class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {
  @override
  Future<OrderModel> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
  }) async {
    final payload = {
      'items': items,
      'deliveryAddress': deliveryAddress,
      'paymentMethod': paymentMethod,
    };

    debugPrint('📦 [OrderRemoteDataSource] Placing order: ${jsonEncode(payload)}');
    final response = await ApiClient.post('/orders', payload);

    if (response.statusCode == 201 || response.statusCode == 200) {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final orderJson = json['order'] as Map<String, dynamic>? ?? json;
      return OrderModel.fromJson(orderJson);
    } else {
      final errorJson = jsonDecode(response.body);
      final message = errorJson is Map ? errorJson['message'] ?? 'Failed to place order' : 'Failed to place order';
      throw Exception(message);
    }
  }

  @override
  Future<List<OrderModel>> getMyOrders() async {
    debugPrint('📦 [OrderRemoteDataSource] Fetching user orders...');
    final response = await ApiClient.get('/orders');

    if (response.statusCode == 200) {
      final jsonList = jsonDecode(response.body) as List<dynamic>;
      return jsonList
          .whereType<Map<String, dynamic>>()
          .map((item) => OrderModel.fromJson(item))
          .toList();
    } else {
      final errorJson = jsonDecode(response.body);
      final message = errorJson is Map ? errorJson['message'] ?? 'Failed to fetch orders' : 'Failed to fetch orders';
      throw Exception(message);
    }
  }

  @override
  Future<OrderModel> getOrderById(String orderId) async {
    debugPrint('📦 [OrderRemoteDataSource] Fetching order $orderId...');
    final response = await ApiClient.get('/orders/$orderId');

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      return OrderModel.fromJson(json);
    } else {
      final errorJson = jsonDecode(response.body);
      final message = errorJson is Map ? errorJson['message'] ?? 'Order not found' : 'Order not found';
      throw Exception(message);
    }
  }
}

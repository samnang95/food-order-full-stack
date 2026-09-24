import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../../../core/db/local_db.dart';
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

  Future<OrderModel> cancelOrder(String orderId);
}

class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {
  static const String _keyCachedOrders = 'cached_user_orders_list';

  List<OrderModel> _getCachedOrders() {
    try {
      final jsonStr = LocalDB.getString(_keyCachedOrders);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final List<dynamic> list = jsonDecode(jsonStr);
        return list
            .whereType<Map<String, dynamic>>()
            .map((item) => OrderModel.fromJson(item))
            .toList();
      }
    } catch (e) {
      debugPrint('⚠️ [OrderRemoteDataSource] Failed to read cached orders: $e');
    }
    return [];
  }

  Future<void> _cacheOrder(OrderModel newOrder) async {
    try {
      final cached = _getCachedOrders();
      // Remove duplicate if it already exists
      cached.removeWhere((o) => o.id == newOrder.id);
      cached.insert(0, newOrder);
      if (cached.length > 50) cached.removeRange(50, cached.length);
      final jsonList = cached.map((o) => o.toJson()).toList();
      await LocalDB.setString(_keyCachedOrders, jsonEncode(jsonList));
      debugPrint('💾 [OrderRemoteDataSource] Cached order ${newOrder.id}. Total cached: ${cached.length}');
    } catch (e) {
      debugPrint('⚠️ [OrderRemoteDataSource] Failed to cache order: $e');
    }
  }

  Future<void> _saveAllCachedOrders(List<OrderModel> orders) async {
    try {
      final jsonList = orders.map((o) => o.toJson()).toList();
      await LocalDB.setString(_keyCachedOrders, jsonEncode(jsonList));
      debugPrint('💾 [OrderRemoteDataSource] Saved ${orders.length} orders to local cache');
    } catch (e) {
      debugPrint('⚠️ [OrderRemoteDataSource] Failed to save all cached orders: $e');
    }
  }

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
      final model = OrderModel.fromJson(orderJson);
      await _cacheOrder(model);
      return model;
    } else {
      final errorJson = jsonDecode(response.body);
      final message = errorJson is Map ? errorJson['message'] ?? 'Failed to place order' : 'Failed to place order';
      throw Exception(message);
    }
  }

  @override
  Future<List<OrderModel>> getMyOrders() async {
    debugPrint('📦 [OrderRemoteDataSource] Fetching user orders...');
    try {
      final response = await ApiClient.get('/orders');

      if (response.statusCode == 200) {
        final jsonList = jsonDecode(response.body) as List<dynamic>;
        final models = jsonList
            .whereType<Map<String, dynamic>>()
            .map((item) => OrderModel.fromJson(item))
            .toList();
        await _saveAllCachedOrders(models);
        return models;
      } else {
        final cached = _getCachedOrders();
        if (cached.isNotEmpty) {
          debugPrint('📦 [OrderRemoteDataSource] Returning ${cached.length} cached orders after server returned status ${response.statusCode}');
          return cached;
        }
        final errorJson = jsonDecode(response.body);
        final message = errorJson is Map ? errorJson['message'] ?? 'Failed to fetch orders' : 'Failed to fetch orders';
        throw Exception(message);
      }
    } catch (e) {
      final cached = _getCachedOrders();
      if (cached.isNotEmpty) {
        debugPrint('📦 [OrderRemoteDataSource] Returning ${cached.length} cached orders after exception: $e');
        return cached;
      }
      rethrow;
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

  @override
  Future<OrderModel> cancelOrder(String orderId) async {
    debugPrint('📦 [OrderRemoteDataSource] Cancelling order $orderId...');
    final response = await ApiClient.update('/orders/$orderId/status', {'status': 'cancelled'});

    if (response.statusCode == 200) {
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final orderJson = json['order'] as Map<String, dynamic>? ?? json;
      return OrderModel.fromJson(orderJson);
    } else {
      final errorJson = jsonDecode(response.body);
      final message = errorJson is Map ? errorJson['message'] ?? 'Failed to cancel order' : 'Failed to cancel order';
      throw Exception(message);
    }
  }
}

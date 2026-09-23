import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../../domain/order/repositories/order_repository.dart';
import 'orders_intent.dart';
import 'orders_state.dart';

class OrdersStore extends GetxController {
  final OrderRepository orderRepository;

  OrdersStore({required this.orderRepository});

  final Rx<OrdersState> state = const OrdersState().obs;

  @override
  void onInit() {
    super.onInit();
    _fetchOrders();
  }

  void onIntent(OrdersIntent intent) {
    switch (intent) {
      case FetchOrdersIntent():
        _fetchOrders();
      case ChangeOrdersFilterIntent(:final filterIndex):
        state.value = state.value.copyWith(selectedFilter: filterIndex);
    }
  }

  Future<void> _fetchOrders() async {
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final orders = await orderRepository.getMyOrders();
      debugPrint('📦 [OrdersStore] Loaded ${orders.length} orders from backend');
      state.value = state.value.copyWith(
        orders: orders,
        isLoading: false,
      );
    } catch (e) {
      debugPrint('⚠️ [OrdersStore] Error fetching orders: $e');
      state.value = state.value.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }
}

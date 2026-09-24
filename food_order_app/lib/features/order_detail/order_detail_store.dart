import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/cart_service.dart';
import '../../domain/food/entities/food_entity.dart';
import '../../domain/order/entities/order_entity.dart';
import '../../domain/order/repositories/order_repository.dart';
import '../../routes/app_routes.dart';
import '../orders/orders_intent.dart';
import '../orders/orders_store.dart';
import 'order_detail_intent.dart';
import 'order_detail_state.dart';

class OrderDetailStore extends GetxController {
  final OrderRepository orderRepository;
  final OrderEntity initialOrder;

  OrderDetailStore({
    required this.orderRepository,
    required this.initialOrder,
  });

  late final Rx<OrderDetailState> state = OrderDetailState(order: initialOrder).obs;

  CartService get cartService {
    if (Get.isRegistered<CartService>()) {
      return Get.find<CartService>();
    }
    return Get.put(CartService(), permanent: true);
  }

  void onIntent(OrderDetailIntent intent) {
    switch (intent) {
      case RefreshOrderDetailIntent():
        _onRefresh();
      case CancelOrderIntent():
        _onCancelOrder();
      case ReorderItemsIntent():
        _onReorder();
    }
  }

  Future<void> _onRefresh() async {
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final updated = await orderRepository.getOrderById(state.value.order.id);
      state.value = state.value.copyWith(order: updated, isLoading: false);
    } catch (e) {
      state.value = state.value.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  void _onCancelOrder() {
    if (state.value.order.status != 'pending') {
      if (Get.context != null) {
        Get.snackbar(
          'Cannot Cancel',
          'This order has already been processed and cannot be cancelled.',
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 12,
        );
      }
      return;
    }

    Get.dialog(
      AlertDialog(
        title: const Text('Cancel Order?'),
        content: const Text(
          'Are you sure you want to cancel this order? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Keep Order'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Get.back();
              _confirmCancellation();
            },
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmCancellation() async {
    state.value = state.value.copyWith(isCancelling: true, errorMessage: null);

    try {
      final cancelled = await orderRepository.cancelOrder(state.value.order.id);
      state.value = state.value.copyWith(order: cancelled, isCancelling: false);

      // Refresh Orders tab if active
      if (Get.isRegistered<OrdersStore>()) {
        Get.find<OrdersStore>().onIntent(const FetchOrdersIntent());
      }

      if (Get.context != null) {
        Get.snackbar(
          'Order Cancelled',
          'Your order has been cancelled successfully.',
          backgroundColor: const Color(0xFF10B981),
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 12,
        );
      }
    } catch (e) {
      final msg = e.toString().replaceFirst('Exception: ', '');
      state.value = state.value.copyWith(isCancelling: false, errorMessage: msg);

      if (Get.context != null) {
        Get.snackbar(
          'Cancellation Failed',
          msg,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 12,
        );
      }
    }
  }

  void _onReorder() {
    for (final item in state.value.order.items) {
      final food = FoodEntity(
        id: item.foodId,
        name: item.foodName,
        imageUrl: item.foodImageUrl,
        price: item.price,
      );
      cartService.addItem(food, quantity: item.quantity);
    }

    if (Get.context != null) {
      Get.snackbar(
        'Items Added to Cart! 🛒',
        'Added ${state.value.order.items.length} items from order ${state.value.order.shortId}.',
        backgroundColor: AppColors.primary,
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP,
        margin: const EdgeInsets.all(16),
        borderRadius: 12,
        duration: const Duration(seconds: 2),
      );
    }

    Get.toNamed(AppRoutes.cart);
  }
}

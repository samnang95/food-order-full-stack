import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/api_client.dart';
import '../../core/services/cart_service.dart';
import '../../core/services/socket_service.dart';
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

  final _socketService = SocketService.instance;

  CartService get cartService {
    if (Get.isRegistered<CartService>()) {
      return Get.find<CartService>();
    }
    return Get.put(CartService(), permanent: true);
  }

  @override
  void onInit() {
    super.onInit();
    // Auto-connect to tracking if order is out for delivery
    if (initialOrder.status == 'out_for_delivery') {
      _startTracking();
    }
  }

  @override
  void onClose() {
    _stopTracking();
    super.onClose();
  }

  void onIntent(OrderDetailIntent intent) {
    switch (intent) {
      case RefreshOrderDetailIntent():
        _onRefresh();
      case CancelOrderIntent():
        _onCancelOrder();
      case ReorderItemsIntent():
        _onReorder();
      case SimulateDeliveryIntent():
        _onSimulateDelivery();
    }
  }

  Future<void> _onSimulateDelivery() async {
    final orderId = state.value.order.id;
    try {
      final res = await ApiClient.update('/orders/$orderId/status', {'status': 'out_for_delivery'});
      if (res.statusCode == 200) {
        _startTracking();
        await _onRefresh();
        final ctx = Get.context;
        if (ctx != null && ctx.mounted) {
          final title = 'driverDispatched'.getString(ctx).isNotEmpty
              ? 'driverDispatched'.getString(ctx)
              : 'Driver Dispatched! 🚴';
          final desc = 'driverDispatchedDesc'.getString(ctx).isNotEmpty
              ? 'driverDispatchedDesc'.getString(ctx)
              : 'Live driver simulation started! Watch the rider deliver to your location.';
          Get.snackbar(
            title,
            desc,
            backgroundColor: AppColors.primary,
            colorText: Colors.white,
            snackPosition: SnackPosition.TOP,
            margin: const EdgeInsets.all(16),
            borderRadius: 12,
          );
        }
      }
    } catch (e) {
      debugPrint('Error simulating delivery: $e');
    }
  }

  /// Start listening for real-time driver location updates
  void _startTracking() {
    final orderId = state.value.order.id;
    debugPrint('🗺️ [OrderDetail] Starting tracking for $orderId');

    _socketService.connect();
    _socketService.joinOrder(orderId);

    state.value = state.value.copyWith(isTrackingActive: true);

    _socketService.onDriverLocation((data) {
      debugPrint('📍 [OrderDetail] Driver location: (${data['lat']}, ${data['lng']}) ETA: ${data['eta']}min');
      state.value = state.value.copyWith(
        driverLat: (data['lat'] as num?)?.toDouble(),
        driverLng: (data['lng'] as num?)?.toDouble(),
        driverHeading: (data['heading'] as num?)?.toDouble(),
        estimatedEta: (data['eta'] as num?)?.toInt(),
        trackingProgress: (data['progress'] as num?)?.toDouble(),
        restaurantLat: (data['restaurantLat'] as num?)?.toDouble(),
        restaurantLng: (data['restaurantLng'] as num?)?.toDouble(),
        deliveryLat: (data['deliveryLat'] as num?)?.toDouble(),
        deliveryLng: (data['deliveryLng'] as num?)?.toDouble(),
      );
    });

    _socketService.onOrderStatusChanged((data) {
      debugPrint('📦 [OrderDetail] Status changed: ${data['status']}');
      final newStatus = data['status'] as String?;
      if (newStatus == 'delivered') {
        _stopTracking();
        _onRefresh();

        if (Get.context != null) {
          final ctx = Get.context!;
          final title = 'orderDelivered'.getString(ctx).isNotEmpty
              ? 'orderDelivered'.getString(ctx)
              : 'Order Delivered! 🎉';
          final desc = 'orderDeliveredDesc'.getString(ctx).isNotEmpty
              ? 'orderDeliveredDesc'.getString(ctx)
              : 'Your food has arrived. Enjoy your meal!';
          Get.snackbar(
            title,
            desc,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.TOP,
            margin: const EdgeInsets.all(16),
            borderRadius: 12,
            duration: const Duration(seconds: 4),
          );
        }
      }
    });
  }

  /// Stop listening for driver location updates
  void _stopTracking() {
    final orderId = state.value.order.id;
    _socketService.offDriverLocation();
    _socketService.offOrderStatusChanged();
    _socketService.leaveOrder(orderId);
    state.value = state.value.copyWith(isTrackingActive: false);
    debugPrint('🗺️ [OrderDetail] Stopped tracking for $orderId');
  }

  Future<void> _onRefresh() async {
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final updated = await orderRepository.getOrderById(state.value.order.id);
      state.value = state.value.copyWith(order: updated, isLoading: false);

      // Start tracking if status changed to out_for_delivery
      if (updated.status == 'out_for_delivery' && !state.value.isTrackingActive) {
        _startTracking();
      }
      // Stop tracking if no longer out for delivery
      if (updated.status != 'out_for_delivery' && state.value.isTrackingActive) {
        _stopTracking();
      }
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

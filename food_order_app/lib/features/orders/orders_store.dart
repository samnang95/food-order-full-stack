import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/cart_service.dart';
import '../../data/order/datasources/order_remote_datasource.dart';
import '../../data/order/repositories/order_repository_impl.dart';
import '../../domain/food/entities/food_entity.dart';
import '../../domain/order/entities/order_entity.dart';
import '../../domain/order/repositories/order_repository.dart';
import '../../routes/app_routes.dart';
import 'orders_intent.dart';
import 'orders_state.dart';

class OrdersStore extends GetxController {
  final OrderRepository orderRepository;
  final CartService cartService;

  OrdersStore({
    required this.orderRepository,
    CartService? cartService,
  }) : cartService = cartService ??
            (Get.isRegistered<CartService>()
                ? Get.find<CartService>()
                : Get.put(CartService(), permanent: true));

  static OrdersStore get instance {
    if (Get.isRegistered<OrdersStore>()) {
      return Get.find<OrdersStore>();
    }
    final remote = Get.isRegistered<OrderRemoteDataSource>() ? Get.find<OrderRemoteDataSource>() : Get.put<OrderRemoteDataSource>(OrderRemoteDataSourceImpl());
    final repo = Get.isRegistered<OrderRepository>() ? Get.find<OrderRepository>() : Get.put<OrderRepository>(OrderRepositoryImpl(remoteDataSource: remote));
    return Get.put(OrdersStore(orderRepository: repo));
  }

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
      case OrdersScrollChangedIntent(:final isScrolled):
        if (state.value.isScrolled != isScrolled) {
          state.value = state.value.copyWith(isScrolled: isScrolled);
        }
      case ReorderOrderIntent(:final order):
        _reorder(order);
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

  void _reorder(OrderEntity order) {
    int addedCount = 0;
    for (final item in order.items) {
      final food = FoodEntity(
        id: item.foodId,
        name: item.foodName,
        price: item.price,
        imageUrl: item.foodImageUrl,
        categoryId: '',
        categoryName: '',
      );
      cartService.addItem(food, quantity: item.quantity);
      addedCount += item.quantity;
    }

    if (Get.context != null) {
      Get.snackbar(
        'Added to Cart',
        'Added $addedCount item${addedCount == 1 ? '' : 's'} from ${order.shortId} to your cart.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 12,
        duration: const Duration(seconds: 3),
        mainButton: TextButton(
          onPressed: () => Get.toNamed(AppRoutes.cart),
          child: const Text(
            'View Cart',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }
  }
}

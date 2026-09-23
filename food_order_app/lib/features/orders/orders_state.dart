import '../../domain/order/entities/order_entity.dart';

class OrdersState {
  final List<OrderEntity> orders;
  final int selectedFilter; // 0: All, 1: Active, 2: Completed
  final bool isLoading;
  final String? errorMessage;

  const OrdersState({
    this.orders = const [],
    this.selectedFilter = 0,
    this.isLoading = false,
    this.errorMessage,
  });

  List<OrderEntity> get filteredOrders {
    if (selectedFilter == 1) {
      return orders.where((o) => o.isActive).toList();
    } else if (selectedFilter == 2) {
      return orders.where((o) => !o.isActive).toList();
    }
    return orders;
  }

  int get activeCount => orders.where((o) => o.isActive).length;
  int get completedCount => orders.where((o) => !o.isActive).length;

  OrdersState copyWith({
    List<OrderEntity>? orders,
    int? selectedFilter,
    bool? isLoading,
    String? errorMessage,
  }) {
    return OrdersState(
      orders: orders ?? this.orders,
      selectedFilter: selectedFilter ?? this.selectedFilter,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

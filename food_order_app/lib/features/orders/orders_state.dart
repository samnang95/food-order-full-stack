import '../../domain/order/entities/order_entity.dart';

class OrdersState {
  final List<OrderEntity> orders;
  final int selectedFilter;
  final bool isLoading;
  final bool isScrolled;
  final String? errorMessage;

  const OrdersState({
    this.orders = const [],
    this.selectedFilter = 0,
    this.isLoading = false,
    this.isScrolled = false,
    this.errorMessage,
  });

  List<OrderEntity> get filteredOrders {
    switch (selectedFilter) {
      case 1:
        return orders.where((o) => o.isActive).toList();
      case 2:
        return orders.where((o) => o.isDelivered).toList();
      case 3:
        return orders.where((o) => o.isCancelled).toList();
      default:
        return orders;
    }
  }

  int get totalCount => orders.length;
  int get activeCount => orders.where((o) => o.isActive).length;
  int get completedCount => orders.where((o) => o.isDelivered).length;
  int get cancelledCount => orders.where((o) => o.isCancelled).length;

  OrdersState copyWith({
    List<OrderEntity>? orders,
    int? selectedFilter,
    bool? isLoading,
    bool? isScrolled,
    String? errorMessage,
  }) {
    return OrdersState(
      orders: orders ?? this.orders,
      selectedFilter: selectedFilter ?? this.selectedFilter,
      isLoading: isLoading ?? this.isLoading,
      isScrolled: isScrolled ?? this.isScrolled,
      errorMessage: errorMessage,
    );
  }
}

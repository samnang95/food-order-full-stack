import '../../domain/order/entities/order_entity.dart';

class OrderDetailState {
  final OrderEntity order;
  final bool isLoading;
  final bool isCancelling;
  final String? errorMessage;

  const OrderDetailState({
    required this.order,
    this.isLoading = false,
    this.isCancelling = false,
    this.errorMessage,
  });

  OrderDetailState copyWith({
    OrderEntity? order,
    bool? isLoading,
    bool? isCancelling,
    String? errorMessage,
  }) {
    return OrderDetailState(
      order: order ?? this.order,
      isLoading: isLoading ?? this.isLoading,
      isCancelling: isCancelling ?? this.isCancelling,
      errorMessage: errorMessage,
    );
  }
}

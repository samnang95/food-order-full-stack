import '../../domain/order/entities/order_entity.dart';

class OrderDetailState {
  final OrderEntity order;
  final bool isLoading;
  final bool isCancelling;
  final String? errorMessage;
  final String? cancellationReason;
  final double? refundedAmount;

  // Driver tracking fields
  final double? driverLat;
  final double? driverLng;
  final double? driverHeading;
  final int? estimatedEta; // in minutes
  final double? trackingProgress; // 0.0 to 1.0
  final double? restaurantLat;
  final double? restaurantLng;
  final double? deliveryLat;
  final double? deliveryLng;
  final bool isTrackingActive;

  const OrderDetailState({
    required this.order,
    this.isLoading = false,
    this.isCancelling = false,
    this.errorMessage,
    this.cancellationReason,
    this.refundedAmount,
    this.driverLat,
    this.driverLng,
    this.driverHeading,
    this.estimatedEta,
    this.trackingProgress,
    this.restaurantLat,
    this.restaurantLng,
    this.deliveryLat,
    this.deliveryLng,
    this.isTrackingActive = false,
  });

  OrderDetailState copyWith({
    OrderEntity? order,
    bool? isLoading,
    bool? isCancelling,
    String? errorMessage,
    String? cancellationReason,
    double? refundedAmount,
    double? driverLat,
    double? driverLng,
    double? driverHeading,
    int? estimatedEta,
    double? trackingProgress,
    double? restaurantLat,
    double? restaurantLng,
    double? deliveryLat,
    double? deliveryLng,
    bool? isTrackingActive,
  }) {
    return OrderDetailState(
      order: order ?? this.order,
      isLoading: isLoading ?? this.isLoading,
      isCancelling: isCancelling ?? this.isCancelling,
      errorMessage: errorMessage,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      refundedAmount: refundedAmount ?? this.refundedAmount,
      driverLat: driverLat ?? this.driverLat,
      driverLng: driverLng ?? this.driverLng,
      driverHeading: driverHeading ?? this.driverHeading,
      estimatedEta: estimatedEta ?? this.estimatedEta,
      trackingProgress: trackingProgress ?? this.trackingProgress,
      restaurantLat: restaurantLat ?? this.restaurantLat,
      restaurantLng: restaurantLng ?? this.restaurantLng,
      deliveryLat: deliveryLat ?? this.deliveryLat,
      deliveryLng: deliveryLng ?? this.deliveryLng,
      isTrackingActive: isTrackingActive ?? this.isTrackingActive,
    );
  }
}

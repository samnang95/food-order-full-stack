class CheckoutState {
  final String deliveryAddress;
  final double deliveryLat;
  final double deliveryLng;
  final String deliveryNote;
  final String paymentMethod; // 'cash', 'khqr', 'card'
  final bool isLoading;
  final String? errorMessage;

  const CheckoutState({
    this.deliveryAddress = 'Street 271, Boeng Tumpun, Phnom Penh',
    this.deliveryLat = 11.5385,
    this.deliveryLng = 104.9080,
    this.deliveryNote = '',
    this.paymentMethod = 'cash',
    this.isLoading = false,
    this.errorMessage,
  });

  CheckoutState copyWith({
    String? deliveryAddress,
    double? deliveryLat,
    double? deliveryLng,
    String? deliveryNote,
    String? paymentMethod,
    bool? isLoading,
    String? errorMessage,
  }) {
    return CheckoutState(
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      deliveryLat: deliveryLat ?? this.deliveryLat,
      deliveryLng: deliveryLng ?? this.deliveryLng,
      deliveryNote: deliveryNote ?? this.deliveryNote,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

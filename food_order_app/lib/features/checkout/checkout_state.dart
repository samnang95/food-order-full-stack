class CheckoutState {
  final String deliveryAddress;
  final String deliveryNote;
  final String paymentMethod; // 'cash', 'khqr', 'card'
  final bool isLoading;
  final String? errorMessage;

  const CheckoutState({
    this.deliveryAddress = 'Street 271, Boeng Tumpun, Phnom Penh',
    this.deliveryNote = '',
    this.paymentMethod = 'cash',
    this.isLoading = false,
    this.errorMessage,
  });

  CheckoutState copyWith({
    String? deliveryAddress,
    String? deliveryNote,
    String? paymentMethod,
    bool? isLoading,
    String? errorMessage,
  }) {
    return CheckoutState(
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      deliveryNote: deliveryNote ?? this.deliveryNote,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

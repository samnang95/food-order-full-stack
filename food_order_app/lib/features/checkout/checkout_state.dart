class CheckoutState {
  final String deliveryAddress;
  final double deliveryLat;
  final double deliveryLng;
  final String deliveryNote;
  final String paymentMethod; // 'cash', 'khqr', 'card'
  final bool isLoading;
  final String? errorMessage;

  // Voucher / Promo Code fields
  final String? appliedVoucherCode;
  final double discountAmount;
  final bool isApplyingVoucher;
  final String? voucherError;
  final String? voucherSuccessMessage;
  final List<Map<String, dynamic>> availableVouchers;

  const CheckoutState({
    this.deliveryAddress = 'Street 271, Boeng Tumpun, Phnom Penh',
    this.deliveryLat = 11.5385,
    this.deliveryLng = 104.9080,
    this.deliveryNote = '',
    this.paymentMethod = 'cash',
    this.isLoading = false,
    this.errorMessage,
    this.appliedVoucherCode,
    this.discountAmount = 0.0,
    this.isApplyingVoucher = false,
    this.voucherError,
    this.voucherSuccessMessage,
    this.availableVouchers = const [],
  });

  CheckoutState copyWith({
    String? deliveryAddress,
    double? deliveryLat,
    double? deliveryLng,
    String? deliveryNote,
    String? paymentMethod,
    bool? isLoading,
    String? errorMessage,
    String? appliedVoucherCode,
    double? discountAmount,
    bool? isApplyingVoucher,
    String? voucherError,
    String? voucherSuccessMessage,
    List<Map<String, dynamic>>? availableVouchers,
    bool clearVoucher = false,
  }) {
    return CheckoutState(
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      deliveryLat: deliveryLat ?? this.deliveryLat,
      deliveryLng: deliveryLng ?? this.deliveryLng,
      deliveryNote: deliveryNote ?? this.deliveryNote,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      appliedVoucherCode: clearVoucher ? null : (appliedVoucherCode ?? this.appliedVoucherCode),
      discountAmount: clearVoucher ? 0.0 : (discountAmount ?? this.discountAmount),
      isApplyingVoucher: isApplyingVoucher ?? this.isApplyingVoucher,
      voucherError: voucherError,
      voucherSuccessMessage: clearVoucher ? null : (voucherSuccessMessage ?? this.voucherSuccessMessage),
      availableVouchers: availableVouchers ?? this.availableVouchers,
    );
  }
}

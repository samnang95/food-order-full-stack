import '../../domain/address/entities/saved_address_entity.dart';

class CheckoutState {
  final String deliveryAddress;
  final double deliveryLat;
  final double deliveryLng;
  final String deliveryNote;
  final String paymentMethod; // 'cash', 'khqr', 'card'
  final bool isLoading;
  final String? errorMessage;

  // Saved Addresses
  final List<SavedAddressEntity> savedAddresses;
  final String? selectedAddressId;

  // Voucher / Promo Code fields
  final String? appliedVoucherCode;
  final double discountAmount;
  final bool isApplyingVoucher;
  final String? voucherError;
  final String? voucherSuccessMessage;
  final List<Map<String, dynamic>> availableVouchers;

  // Order Preferences & Cutlery
  final bool requestCutlery;
  final int cutleryCount;
  final String kitchenNote;
  final List<String> kitchenPreferences;
  final List<String> selectedCondiments;

  // Driver Tip
  final double driverTip;

  // Delivery Scheduling
  final bool isScheduled;
  final String? scheduledDate;
  final String? scheduledTimeSlot;

  const CheckoutState({
    this.deliveryAddress = 'Street 271, Boeng Tumpun, Phnom Penh',
    this.deliveryLat = 11.5385,
    this.deliveryLng = 104.9080,
    this.deliveryNote = '',
    this.paymentMethod = 'cash',
    this.isLoading = false,
    this.errorMessage,
    this.savedAddresses = const [],
    this.selectedAddressId,
    this.appliedVoucherCode,
    this.discountAmount = 0.0,
    this.isApplyingVoucher = false,
    this.voucherError,
    this.voucherSuccessMessage,
    this.availableVouchers = const [],
    this.requestCutlery = false,
    this.cutleryCount = 1,
    this.kitchenNote = '',
    this.kitchenPreferences = const [],
    this.selectedCondiments = const [],
    this.driverTip = 0.0,
    this.isScheduled = false,
    this.scheduledDate,
    this.scheduledTimeSlot,
  });

  CheckoutState copyWith({
    String? deliveryAddress,
    double? deliveryLat,
    double? deliveryLng,
    String? deliveryNote,
    String? paymentMethod,
    bool? isLoading,
    String? errorMessage,
    List<SavedAddressEntity>? savedAddresses,
    String? selectedAddressId,
    bool clearSelectedAddress = false,
    String? appliedVoucherCode,
    double? discountAmount,
    bool? isApplyingVoucher,
    String? voucherError,
    String? voucherSuccessMessage,
    List<Map<String, dynamic>>? availableVouchers,
    bool clearVoucher = false,
    bool? requestCutlery,
    int? cutleryCount,
    String? kitchenNote,
    List<String>? kitchenPreferences,
    List<String>? selectedCondiments,
    double? driverTip,
    bool? isScheduled,
    String? scheduledDate,
    String? scheduledTimeSlot,
    bool clearSchedule = false,
  }) {
    return CheckoutState(
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      deliveryLat: deliveryLat ?? this.deliveryLat,
      deliveryLng: deliveryLng ?? this.deliveryLng,
      deliveryNote: deliveryNote ?? this.deliveryNote,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      savedAddresses: savedAddresses ?? this.savedAddresses,
      selectedAddressId: clearSelectedAddress ? null : (selectedAddressId ?? this.selectedAddressId),
      appliedVoucherCode: clearVoucher ? null : (appliedVoucherCode ?? this.appliedVoucherCode),
      discountAmount: clearVoucher ? 0.0 : (discountAmount ?? this.discountAmount),
      isApplyingVoucher: isApplyingVoucher ?? this.isApplyingVoucher,
      voucherError: voucherError,
      voucherSuccessMessage: clearVoucher ? null : (voucherSuccessMessage ?? this.voucherSuccessMessage),
      availableVouchers: availableVouchers ?? this.availableVouchers,
      requestCutlery: requestCutlery ?? this.requestCutlery,
      cutleryCount: cutleryCount ?? this.cutleryCount,
      kitchenNote: kitchenNote ?? this.kitchenNote,
      kitchenPreferences: kitchenPreferences ?? this.kitchenPreferences,
      selectedCondiments: selectedCondiments ?? this.selectedCondiments,
      driverTip: driverTip ?? this.driverTip,
      isScheduled: isScheduled ?? this.isScheduled,
      scheduledDate: clearSchedule ? null : (scheduledDate ?? this.scheduledDate),
      scheduledTimeSlot: clearSchedule ? null : (scheduledTimeSlot ?? this.scheduledTimeSlot),
    );
  }
}

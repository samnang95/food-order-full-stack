class VoucherValidationResult {
  final bool valid;
  final String code;
  final String title;
  final String discountType;
  final double discountAmount;
  final double finalSubtotal;
  final String message;
  final double? minSpend;

  const VoucherValidationResult({
    required this.valid,
    required this.code,
    this.title = '',
    this.discountType = '',
    this.discountAmount = 0.0,
    this.finalSubtotal = 0.0,
    required this.message,
    this.minSpend,
  });

  factory VoucherValidationResult.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>?;
    if (data != null) {
      return VoucherValidationResult(
        valid: data['valid'] as bool? ?? true,
        code: (data['code'] as String? ?? '').toUpperCase(),
        title: data['title'] as String? ?? '',
        discountType: data['discountType'] as String? ?? '',
        discountAmount: (data['discountAmount'] as num?)?.toDouble() ?? 0.0,
        finalSubtotal: (data['finalSubtotal'] as num?)?.toDouble() ?? 0.0,
        message: data['message'] as String? ?? (json['message'] as String? ?? ''),
        minSpend: (json['minSpend'] as num?)?.toDouble(),
      );
    }

    return VoucherValidationResult(
      valid: json['valid'] as bool? ?? false,
      code: (json['code'] as String? ?? '').toUpperCase(),
      title: json['title'] as String? ?? '',
      discountType: json['discountType'] as String? ?? '',
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      finalSubtotal: (json['finalSubtotal'] as num?)?.toDouble() ?? 0.0,
      message: json['message'] as String? ?? 'Invalid voucher',
      minSpend: (json['minSpend'] as num?)?.toDouble(),
    );
  }
}

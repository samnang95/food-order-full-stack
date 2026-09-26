class VoucherEntity {
  final String code;
  final String title;
  final String desc;
  final String type; // 'percentage' or 'fixed'
  final double value;
  final double minSpend;
  final double? maxDiscount;

  const VoucherEntity({
    required this.code,
    required this.title,
    required this.desc,
    required this.type,
    required this.value,
    required this.minSpend,
    this.maxDiscount,
  });

  bool isEligible(double subtotal) => subtotal >= minSpend;

  double amountNeeded(double subtotal) =>
      (minSpend - subtotal).clamp(0.0, double.infinity);

  double calculateDiscount(double subtotal) {
    if (!isEligible(subtotal)) return 0.0;

    double discount = 0.0;
    if (type == 'percentage') {
      discount = (subtotal * value) / 100.0;
      if (maxDiscount != null && discount > maxDiscount!) {
        discount = maxDiscount!;
      }
    } else {
      discount = value;
    }

    discount = discount.clamp(0.0, subtotal);
    return double.parse(discount.toStringAsFixed(2));
  }

  factory VoucherEntity.fromJson(Map<String, dynamic> json) {
    return VoucherEntity(
      code: (json['code'] as String? ?? '').trim().toUpperCase(),
      title: json['title'] as String? ?? '',
      desc: json['desc'] as String? ?? '',
      type: json['type'] as String? ?? 'fixed',
      value: (json['value'] as num?)?.toDouble() ?? 0.0,
      minSpend: (json['minSpend'] as num?)?.toDouble() ?? 0.0,
      maxDiscount: (json['maxDiscount'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
    'code': code,
    'title': title,
    'desc': desc,
    'type': type,
    'value': value,
    'minSpend': minSpend,
    if (maxDiscount != null) 'maxDiscount': maxDiscount,
  };

  VoucherEntity copyWith({
    String? code,
    String? title,
    String? desc,
    String? type,
    double? value,
    double? minSpend,
    double? maxDiscount,
  }) {
    return VoucherEntity(
      code: code ?? this.code,
      title: title ?? this.title,
      desc: desc ?? this.desc,
      type: type ?? this.type,
      value: value ?? this.value,
      minSpend: minSpend ?? this.minSpend,
      maxDiscount: maxDiscount ?? this.maxDiscount,
    );
  }
}

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../checkout_intent.dart';
import '../checkout_store.dart';

class CheckoutPaymentSelector extends GetView<CheckoutStore> {
  const CheckoutPaymentSelector({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    final paymentMethods = [
      {
        'id': 'cash',
        'title': 'Cash on Delivery',
        'subtitle': 'Pay with cash upon arrival',
        'icon': Icons.payments_rounded,
        'badge': 'Popular',
        'badgeColor': const Color(0xFF10B981),
      },
      {
        'id': 'khqr',
        'title': 'ABA KHQR / Mobile',
        'subtitle': 'Instant scan with any banking app',
        'icon': Icons.qr_code_scanner_rounded,
        'badge': 'Instant',
        'badgeColor': const Color(0xFF3B82F6),
      },
      {
        'id': 'card',
        'title': 'Credit or Debit Card',
        'subtitle': 'Visa, Mastercard, UnionPay',
        'icon': Icons.credit_card_rounded,
        'badge': null,
        'badgeColor': null,
      },
    ];

    return Obx(() {
      final selectedMethod = controller.state.value.paymentMethod;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.account_balance_wallet_rounded,
                    color: AppColors.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'Payment Method',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : AppColors.neutral,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            ...paymentMethods.map((pm) {
              final isSelected = selectedMethod == pm['id'];
              final id = pm['id'] as String;
              final title = pm['title'] as String;
              final subtitle = pm['subtitle'] as String;
              final icon = pm['icon'] as IconData;
              final badge = pm['badge'] as String?;
              final badgeColor = pm['badgeColor'] as Color?;

              return GestureDetector(
                onTap: () => controller.onIntent(ChangePaymentMethod(id)),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primary.withValues(alpha: isDark ? 0.15 : 0.08)
                        : (isDark ? const Color(0xFF161C2C) : const Color(0xFFF9FAFB)),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.primary
                          : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE5E7EB)),
                      width: isSelected ? 1.5 : 1.0,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.primary
                              : (isDark ? const Color(0xFF242E44) : Colors.white),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          icon,
                          color: isSelected
                              ? Colors.white
                              : (isDark ? Colors.white70 : AppColors.neutral),
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  title,
                                  style: TextStyle(
                                    fontSize: 13.5,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                                    color: isDark ? Colors.white : AppColors.neutral,
                                  ),
                                ),
                                if (badge != null && badgeColor != null) ...[
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: badgeColor.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      badge,
                                      style: TextStyle(
                                        color: badgeColor,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              subtitle,
                              style: TextStyle(
                                fontSize: 11.5,
                                color: isDark ? Colors.white54 : AppColors.subtitleColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected ? AppColors.primary : Colors.grey,
                            width: 2,
                          ),
                          color: isSelected ? AppColors.primary : Colors.transparent,
                        ),
                        child: isSelected
                            ? const Icon(Icons.check, size: 14, color: Colors.white)
                            : null,
                      ),
                    ],
                  ),
                ),
              );
            }),
          ],
        ),
      );
    });
  }
}

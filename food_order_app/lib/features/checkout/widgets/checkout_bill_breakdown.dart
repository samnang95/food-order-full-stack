import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/translation_helper.dart';
import '../checkout_store.dart';

class CheckoutBillBreakdown extends GetView<CheckoutStore> {
  const CheckoutBillBreakdown({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;
    final textMuted = isDark ? Colors.white60 : AppColors.subtitleColor;

    return Obx(() {
      final state = controller.state.value;
      final subtotal = controller.cartService.subtotal;
      final deliveryFee = controller.deliveryFee;
      final discount = state.discountAmount;
      final total = controller.finalTotal;
      final isFreeDelivery = deliveryFee == 0.0 && subtotal > 0;

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
          children: [
            _buildRow(
              title: 'subtotal'.trOr(context, 'Subtotal'),
              value: '\$${subtotal.toStringAsFixed(2)}',
              isDark: isDark,
              textColor: textMuted,
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'deliveryFee'.trOr(context, 'Delivery Fee'),
                  style: TextStyle(
                    fontSize: 13.5,
                    color: textMuted,
                  ),
                ),
                isFreeDelivery
                    ? Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'FREE',
                          style: TextStyle(
                            color: Color(0xFF10B981),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      )
                    : Text(
                        '\$${deliveryFee.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : AppColors.neutral,
                        ),
                      ),
              ],
            ),
            if (discount > 0) ...[
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.discount_rounded, size: 14, color: Color(0xFF10B981)),
                      const SizedBox(width: 5),
                      Text(
                        '${'discount'.trOr(context, 'Promo Discount')} (${state.appliedVoucherCode})',
                        style: const TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF10B981),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '-\$${discount.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF10B981),
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 12),
            Divider(color: isDark ? const Color(0xFF2A364F) : const Color(0xFFF3F4F6)),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'totalPayment'.trOr(context, 'Total Payment'),
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.white : AppColors.neutral,
                  ),
                ),
                Text(
                  '\$${total.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w900,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildRow({
    required String title,
    required String value,
    required bool isDark,
    required Color textColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: TextStyle(fontSize: 13.5, color: textColor),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : AppColors.neutral,
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../cart_store.dart';

class CartBillSummary extends GetView<CartStore> {
  const CartBillSummary({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final textMuted = isDark ? Colors.white60 : AppColors.subtitleColor;

    return Obx(() {
      final subtotal = controller.cartService.subtotal;
      final deliveryFee = controller.cartService.deliveryFee;
      final total = controller.cartService.totalAmount;
      final progress = controller.cartService.freeDeliveryProgress;
      final remaining = controller.cartService.freeDeliveryRemaining;
      final isFreeDelivery = deliveryFee == 0.0 && subtotal > 0;

      return Column(
        children: [
          // Free Delivery Banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isFreeDelivery
                  ? const Color(0xFF10B981).withValues(alpha: 0.12)
                  : AppColors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isFreeDelivery
                    ? const Color(0xFF10B981).withValues(alpha: 0.3)
                    : AppColors.primary.withValues(alpha: 0.2),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      isFreeDelivery
                          ? Icons.check_circle_rounded
                          : Icons.local_shipping_rounded,
                      size: 18,
                      color: isFreeDelivery ? const Color(0xFF10B981) : AppColors.primary,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        isFreeDelivery
                            ? '🎉 You unlocked FREE delivery!'
                            : 'Add \$${remaining.toStringAsFixed(2)} more for FREE delivery',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isFreeDelivery ? const Color(0xFF10B981) : AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                if (!isFreeDelivery) ...[
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 5,
                      backgroundColor: isDark ? const Color(0xFF283044) : Colors.grey[200],
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Bill Summary Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark
                    ? const Color(0xFF283044)
                    : AppColors.borderColor.withValues(alpha: 0.8),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Order Summary',
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 14),

                // Subtotal
                _buildRow(
                  label: 'Subtotal',
                  value: '\$${subtotal.toStringAsFixed(2)}',
                  textMuted: textMuted,
                ),
                const SizedBox(height: 10),

                // Delivery Fee
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Delivery Fee',
                      style: TextStyle(fontSize: 14, color: textMuted),
                    ),
                    Text(
                      isFreeDelivery ? 'FREE' : '\$${deliveryFee.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isFreeDelivery ? const Color(0xFF10B981) : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                Divider(
                  color: isDark ? const Color(0xFF283044) : AppColors.borderColor,
                  height: 1,
                ),
                const SizedBox(height: 14),

                // Grand Total
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total Amount',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      '\$${total.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      );
    });
  }

  Widget _buildRow({
    required String label,
    required String value,
    required Color textMuted,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 14, color: textMuted),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../checkout_store.dart';

class CheckoutOrderSummaryCard extends GetView<CheckoutStore> {
  const CheckoutOrderSummaryCard({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    return Obx(() {
      final items = controller.cartService.items;
      final totalQty = controller.cartService.totalQuantity;

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
                    Icons.shopping_bag_outlined,
                    color: AppColors.primary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'Order Items ($totalQty)',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : AppColors.neutral,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: items.length,
              separatorBuilder: (context, index) => Divider(
                color: isDark ? const Color(0xFF2A364F) : const Color(0xFFF3F4F6),
                height: 16,
              ),
              itemBuilder: (context, index) {
                final item = items[index];

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Quantity badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${item.quantity}x',
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),

                    // Name and special note
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.food.name,
                            style: TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.white : AppColors.neutral,
                            ),
                          ),
                          if (item.specialInstructions.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Text(
                              'Note: ${item.specialInstructions}',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontStyle: FontStyle.italic,
                                color: isDark ? Colors.white54 : AppColors.subtitleColor,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    // Item total
                    Text(
                      '\$${item.totalPrice.toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : AppColors.neutral,
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      );
    });
  }
}

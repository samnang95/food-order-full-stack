import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../food_detail_intent.dart';
import '../food_detail_store.dart';

class FoodDetailQuantityCard extends GetView<FoodDetailStore> {
  const FoodDetailQuantityCard({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final textMuted = isDark ? Colors.white60 : AppColors.subtitleColor;

    return Obx(() {
      final state = controller.state.value;

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark
                ? const Color(0xFF283044)
                : AppColors.borderColor.withValues(alpha: 0.8),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Select Portion',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '\$${state.food.price.toStringAsFixed(2)} per item',
                  style: TextStyle(
                    fontSize: 12,
                    color: textMuted,
                  ),
                ),
              ],
            ),
            Row(
              children: [
                _buildQtyButton(
                  icon: Icons.remove_rounded,
                  isDark: isDark,
                  isEnabled: state.quantity > 1,
                  onTap: () => controller.onIntent(const FoodDetailDecrementQty()),
                ),
                Container(
                  constraints: const BoxConstraints(minWidth: 40),
                  alignment: Alignment.center,
                  child: Text(
                    '${state.quantity}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                _buildQtyButton(
                  icon: Icons.add_rounded,
                  isDark: isDark,
                  isEnabled: state.quantity < 99,
                  onTap: () => controller.onIntent(const FoodDetailIncrementQty()),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildQtyButton({
    required IconData icon,
    required bool isDark,
    required bool isEnabled,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: isEnabled ? onTap : null,
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          color: isEnabled
              ? (isDark ? const Color(0xFF283044) : const Color(0xFFF3F4F6))
              : (isDark ? const Color(0xFF1E2638) : const Color(0xFFF9FAFB)),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isDark ? const Color(0xFF374151) : AppColors.borderColor,
          ),
        ),
        child: Icon(
          icon,
          size: 18,
          color: isEnabled
              ? (isDark ? Colors.white : AppColors.neutral)
              : (isDark ? Colors.white24 : Colors.grey[400]),
        ),
      ),
    );
  }
}

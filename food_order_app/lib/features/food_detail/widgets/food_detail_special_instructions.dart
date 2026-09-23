import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../food_detail_intent.dart';
import '../food_detail_store.dart';

class FoodDetailSpecialInstructions extends GetView<FoodDetailStore> {
  const FoodDetailSpecialInstructions({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Special Instructions (Optional)',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark
                  ? const Color(0xFF283044)
                  : AppColors.borderColor.withValues(alpha: 0.8),
            ),
          ),
          child: TextField(
            onChanged: (text) {
              controller.onIntent(FoodDetailSpecialInstructionsChanged(text));
            },
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'e.g. Extra spicy, no onions, sauce on the side...',
              hintStyle: TextStyle(
                color: isDark ? Colors.white30 : Colors.black26,
                fontSize: 13,
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.all(14),
            ),
            style: const TextStyle(fontSize: 14),
          ),
        ),
      ],
    );
  }
}

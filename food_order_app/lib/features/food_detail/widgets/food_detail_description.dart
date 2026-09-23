import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../food_detail_store.dart';

class FoodDetailDescription extends GetView<FoodDetailStore> {
  const FoodDetailDescription({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textMuted = isDark ? Colors.white60 : AppColors.subtitleColor;

    return Obx(() {
      final food = controller.state.value.food;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'About This Food',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            food.description.isNotEmpty
                ? food.description
                : 'Delicious, freshly made ${food.name} prepared with premium ingredients. Served hot and fresh right to your doorstep.',
            style: TextStyle(
              fontSize: 14,
              color: textMuted,
              height: 1.5,
            ),
          ),
        ],
      );
    });
  }
}

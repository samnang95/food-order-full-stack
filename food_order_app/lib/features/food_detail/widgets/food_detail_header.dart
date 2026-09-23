import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../food_detail_intent.dart';
import '../food_detail_store.dart';

class FoodDetailHeader extends GetView<FoodDetailStore> {
  const FoodDetailHeader({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceBg = isDark ? const Color(0xFF121826) : const Color(0xFFF9FAFB);

    return SliverAppBar(
      expandedHeight: 340,
      pinned: true,
      stretch: true,
      backgroundColor: surfaceBg,
      scrolledUnderElevation: 0,
      leading: Padding(
        padding: const EdgeInsets.all(8.0),
        child: _buildCircleButton(
          icon: Icons.arrow_back_ios_new_rounded,
          isDark: isDark,
          onTap: () => Get.back(),
        ),
      ),
      actions: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Obx(() {
            final isFav = controller.state.value.isFavorite;
            return _buildCircleButton(
              icon: isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
              iconColor: isFav ? const Color(0xFFEF4444) : null,
              isDark: isDark,
              onTap: () => controller.onIntent(const FoodDetailToggleFavorite()),
            );
          }),
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        stretchModes: const [
          StretchMode.zoomBackground,
          StretchMode.blurBackground,
        ],
        background: Obx(() {
          final food = controller.state.value.food;
          return Stack(
            fit: StackFit.expand,
            children: [
              Hero(
                tag: 'food_image_${food.id}',
                child: food.imageUrl.isNotEmpty
                    ? Image.network(
                        food.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => _buildPlaceholder(isDark),
                      )
                    : _buildPlaceholder(isDark),
              ),
              // Gradient overlay top (for app bar buttons readability)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: 100,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.5),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              // Gradient overlay bottom (smooth transition to page body)
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        surfaceBg,
                        surfaceBg.withValues(alpha: 0.0),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildCircleButton({
    required IconData icon,
    Color? iconColor,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: (isDark ? const Color(0xFF1E2638) : Colors.white).withValues(alpha: 0.85),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(
          icon,
          size: 18,
          color: iconColor ?? (isDark ? Colors.white : AppColors.neutral),
        ),
      ),
    );
  }

  Widget _buildPlaceholder(bool isDark) {
    return Container(
      color: isDark ? const Color(0xFF1E2638) : const Color(0xFFF3F4F6),
      child: Center(
        child: Icon(
          Icons.fastfood_rounded,
          size: 64,
          color: isDark ? Colors.white24 : Colors.black12,
        ),
      ),
    );
  }
}

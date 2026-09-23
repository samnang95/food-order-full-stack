import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class FoodDetailSpecsCard extends StatelessWidget {
  const FoodDetailSpecsCard({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildSpecItem(
            icon: Icons.star_rounded,
            iconColor: const Color(0xFFF59E0B),
            label: '4.8',
            sublabel: '(120+)',
            isDark: isDark,
          ),
          _buildVerticalDivider(isDark),
          _buildSpecItem(
            icon: Icons.access_time_rounded,
            iconColor: AppColors.primary,
            label: '20-30 min',
            sublabel: 'Prep Time',
            isDark: isDark,
          ),
          _buildVerticalDivider(isDark),
          _buildSpecItem(
            icon: Icons.delivery_dining_rounded,
            iconColor: const Color(0xFF10B981),
            label: 'Free',
            sublabel: 'Delivery',
            isDark: isDark,
          ),
        ],
      ),
    );
  }

  Widget _buildSpecItem({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String sublabel,
    required bool isDark,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: iconColor, size: 20),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
            Text(
              sublabel,
              style: TextStyle(
                fontSize: 10,
                color: isDark ? Colors.white54 : AppColors.subtitleColor,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildVerticalDivider(bool isDark) {
    return Container(
      width: 1,
      height: 28,
      color: isDark ? const Color(0xFF283044) : AppColors.borderColor,
    );
  }
}

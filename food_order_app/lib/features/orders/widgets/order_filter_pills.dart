import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class OrderFilterPills extends StatelessWidget {
  final int selectedFilter;
  final int totalCount;
  final int activeCount;
  final int completedCount;
  final int cancelledCount;
  final bool isScrolled;
  final ValueChanged<int> onFilterChanged;

  const OrderFilterPills({
    super.key,
    required this.selectedFilter,
    required this.totalCount,
    required this.activeCount,
    required this.completedCount,
    required this.cancelledCount,
    required this.isScrolled,
    required this.onFilterChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = Theme.of(context).scaffoldBackgroundColor;

    final filters = [
      (index: 0, label: 'All ($totalCount)'),
      (index: 1, label: 'Active ($activeCount)'),
      (index: 2, label: 'Completed ($completedCount)'),
      if (cancelledCount > 0)
        (index: 3, label: 'Cancelled ($cancelledCount)'),
    ];

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: scaffoldBg,
        boxShadow: isScrolled
            ? [
                BoxShadow(
                  color: isDark
                      ? Colors.black.withValues(alpha: 0.35)
                      : Colors.black.withValues(alpha: 0.06),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ]
            : [],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: filters.map((f) {
            final isSelected = selectedFilter == f.index;
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: GestureDetector(
                onTap: () => onFilterChanged(f.index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 7.5),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primary
                        : (isDark ? const Color(0xFF1E2638) : const Color(0xFFF3ECE7)),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.primary
                          : (isDark ? const Color(0xFF2E3A52) : Colors.transparent),
                    ),
                  ),
                  child: Text(
                    f.label,
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected
                          ? Colors.white
                          : (isDark ? Colors.white70 : AppColors.subtitleColor),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

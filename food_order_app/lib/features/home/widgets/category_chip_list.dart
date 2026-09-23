import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../domain/category/entities/category_entity.dart';

class CategoryChipList extends StatelessWidget {
  final List<CategoryEntity> categories;
  final String selectedCategoryId;
  final ValueChanged<String> onCategorySelected;

  const CategoryChipList({
    super.key,
    required this.categories,
    required this.selectedCategoryId,
    required this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SizedBox(
      height: 42,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: categories.length + 1, // +1 for "All"
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final isAll = index == 0;
          final isSelected = isAll
              ? selectedCategoryId.isEmpty
              : categories[index - 1].id == selectedCategoryId;
          final label = isAll ? 'All' : categories[index - 1].name;

          return GestureDetector(
            onTap: () => onCategorySelected(isAll ? '' : categories[index - 1].id),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary
                    : isDark
                        ? const Color(0xFF1E2638)
                        : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : isDark
                          ? const Color(0xFF2E3A52)
                          : AppColors.borderColor,
                  width: 1.2,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: Center(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected
                        ? Colors.white
                        : isDark
                            ? Colors.white70
                            : AppColors.neutral,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

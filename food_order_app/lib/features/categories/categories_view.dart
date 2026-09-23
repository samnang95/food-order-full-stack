import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/x_search_bar.dart';

class CategoriesView extends StatelessWidget {
  const CategoriesView({super.key});

  static const List<Map<String, dynamic>> _sampleCategories = [
    {
      'title': 'Burgers',
      'icon': Icons.lunch_dining_rounded,
      'color': Color(0xFFF97316),
      'count': '18 items',
    },
    {
      'title': 'Pizza',
      'icon': Icons.local_pizza_rounded,
      'color': Color(0xFFEF4444),
      'count': '14 items',
    },
    {
      'title': 'Asian Cuisine',
      'icon': Icons.ramen_dining_rounded,
      'color': Color(0xFF8B5CF6),
      'count': '22 items',
    },
    {
      'title': 'Healthy Bowls',
      'icon': Icons.eco_rounded,
      'color': Color(0xFF10B981),
      'count': '12 items',
    },
    {
      'title': 'Bakery & Pastry',
      'icon': Icons.bakery_dining_rounded,
      'color': Color(0xFFF59E0B),
      'count': '9 items',
    },
    {
      'title': 'Beverages',
      'icon': Icons.local_cafe_rounded,
      'color': Color(0xFF3B82F6),
      'count': '16 items',
    },
    {
      'title': 'Seafood',
      'icon': Icons.set_meal_rounded,
      'color': Color(0xFF06B6D4),
      'count': '11 items',
    },
    {
      'title': 'Desserts',
      'icon': Icons.icecream_rounded,
      'color': Color(0xFFEC4899),
      'count': '15 items',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'categoriesTitle'.getString(context).isNotEmpty
                  ? 'categoriesTitle'.getString(context)
                  : 'Categories',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              'categoriesSubtitle'.getString(context).isNotEmpty
                  ? 'categoriesSubtitle'.getString(context)
                  : 'Find foods by your favorite category',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isDark ? Colors.white60 : AppColors.subtitleColor,
                  ),
            ),
          ],
        ),
        titleSpacing: 16,
      ),
      body: SafeArea(
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: XSearchBar(),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16.0),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 14,
                  mainAxisSpacing: 14,
                  childAspectRatio: 1.15,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final item = _sampleCategories[index];
                    final color = item['color'] as Color;
                    return Material(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(16),
                      elevation: isDark ? 0 : 2,
                      shadowColor: Colors.black.withValues(alpha: 0.06),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () {},
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isDark
                                  ? const Color(0xFF2E3A52)
                                  : AppColors.borderColor.withValues(alpha: 0.7),
                            ),
                          ),
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: color.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  item['icon'] as IconData,
                                  color: color,
                                  size: 26,
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['title'] as String,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                      color: isDark ? Colors.white : AppColors.neutral,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item['count'] as String,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: isDark ? Colors.white54 : AppColors.subtitleColor,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                  childCount: _sampleCategories.length,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

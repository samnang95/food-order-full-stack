import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/floating_cart_bar.dart';
import '../../domain/category/entities/category_entity.dart';
import '../../routes/app_routes.dart';
import '../home/widgets/food_card.dart';
import 'category_detail_intent.dart';
import 'category_detail_store.dart';

class CategoryDetailView extends GetView<CategoryDetailStore> {
  final CategoryEntity? category;

  const CategoryDetailView({
    super.key,
    this.category,
  });

  CategoryDetailStore get store {
    if (Get.isRegistered<CategoryDetailStore>()) {
      return controller;
    }
    return Get.put(CategoryDetailStore());
  }

  CategoryEntity _resolveCategory(CategoryDetailStore store) {
    if (category != null) return category!;
    if (store.category != null) return store.category!;
    final args = Get.arguments;
    if (args is CategoryEntity) return args;
    if (args is Map && args['name'] != null) {
      return CategoryEntity(
        id: (args['id'] ?? '').toString(),
        name: args['name'] as String,
        description: args['description'] as String? ?? '',
        imageUrl: args['imageUrl'] as String? ?? '',
      );
    }
    return const CategoryEntity(
      id: 'cat_default',
      name: 'Category Dishes',
      description: 'Explore delicious dishes prepared with fresh ingredients',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = Theme.of(context).scaffoldBackgroundColor;
    final bottomInset = MediaQuery.of(context).padding.bottom;
    final catStore = store;
    final cat = _resolveCategory(catStore);

    if (catStore.category == null || catStore.category?.id != cat.id) {
      catStore.onIntent(CategoryDetailInitialize(cat));
    }

    return Scaffold(
      backgroundColor: scaffoldBg,
      body: Stack(
        children: [
          NotificationListener<ScrollNotification>(
            onNotification: (info) {
              catStore.onIntent(CategoryDetailScrollChanged(info.metrics.pixels > 120));
              return false;
            },
            child: CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                // 1. Hero Category Header
                SliverAppBar(
                  expandedHeight: 220,
                  pinned: true,
                  backgroundColor: isDark ? const Color(0xFF141A29) : Colors.white,
                  elevation: 0,
                  leading: Center(
                    child: GestureDetector(
                      onTap: () => Get.back(),
                      child: Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.45),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.arrow_back_ios_new_rounded,
                          size: 16,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  flexibleSpace: FlexibleSpaceBar(
                    titlePadding: const EdgeInsetsDirectional.only(
                      start: 56,
                      bottom: 14,
                      end: 16,
                    ),
                    title: Obx(() {
                      final scrolled = catStore.state.value.isScrolled;
                      return AnimatedOpacity(
                        duration: const Duration(milliseconds: 200),
                        opacity: scrolled ? 1.0 : 0.0,
                        child: Text(
                          cat.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: isDark ? Colors.white : AppColors.neutral,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                      );
                    }),
                    background: ClipRect(
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          // Background Image
                          if (cat.imageUrl.isNotEmpty)
                            Image.network(
                              cat.imageUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (_, _, _) => Container(
                                color: AppColors.primary.withValues(alpha: 0.15),
                                child: const Icon(Icons.restaurant_rounded, size: 48, color: AppColors.primary),
                              ),
                            )
                          else
                            Container(
                              color: AppColors.primary.withValues(alpha: 0.15),
                              child: const Icon(Icons.restaurant_rounded, size: 48, color: AppColors.primary),
                            ),
                          // Dark gradient overlay for text readability
                          DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.black.withValues(alpha: 0.25),
                                  Colors.black.withValues(alpha: 0.85),
                                ],
                              ),
                            ),
                          ),
                          // Title & subtitle on hero banner (fades out as user scrolls up)
                          Positioned(
                            left: 20,
                            right: 20,
                            bottom: 18,
                            child: Obx(() {
                              final scrolled = catStore.state.value.isScrolled;
                              return AnimatedOpacity(
                                duration: const Duration(milliseconds: 150),
                                opacity: scrolled ? 0.0 : 1.0,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      cat.name,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold,
                                        shadows: [
                                          Shadow(color: Colors.black54, blurRadius: 8, offset: Offset(0, 2)),
                                        ],
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    if (cat.description.isNotEmpty) ...[
                                      const SizedBox(height: 4),
                                      Text(
                                        cat.description,
                                        style: TextStyle(
                                          color: Colors.white.withValues(alpha: 0.9),
                                          fontSize: 12.5,
                                          height: 1.3,
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ],
                                ),
                              );
                            }),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // 2. Sort & Filter Pills Bar (Edge-to-edge scrollable)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 14, bottom: 10),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Obx(() {
                        final sort = catStore.state.value.selectedSort;
                        return Row(
                          children: [
                            _buildSortChip(
                              label: 'All Items',
                              isSelected: sort == 'all',
                              onTap: () => catStore.onIntent(const CategoryDetailSortChanged('all')),
                              isDark: isDark,
                            ),
                            const SizedBox(width: 8),
                            _buildSortChip(
                              label: 'Price: Low to High',
                              icon: Icons.arrow_upward_rounded,
                              isSelected: sort == 'price_asc',
                              onTap: () => catStore.onIntent(const CategoryDetailSortChanged('price_asc')),
                              isDark: isDark,
                            ),
                            const SizedBox(width: 8),
                            _buildSortChip(
                              label: 'Price: High to Low',
                              icon: Icons.arrow_downward_rounded,
                              isSelected: sort == 'price_desc',
                              onTap: () => catStore.onIntent(const CategoryDetailSortChanged('price_desc')),
                              isDark: isDark,
                            ),
                          ],
                        );
                      }),
                    ),
                  ),
                ),

                // 3. Dishes Grid
                Obx(() {
                  final foods = catStore.sortedFoods;

                  if (foods.isEmpty) {
                    return SliverFillRemaining(
                      hasScrollBody: false,
                      child: _buildEmptyCategoryState(context, isDark, cat.name),
                    );
                  }

                  return SliverPadding(
                    padding: EdgeInsets.fromLTRB(16, 4, 16, bottomInset + 104),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.62,
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final food = foods[index];
                          return FoodCard(
                            food: food,
                            onTap: () => Get.toNamed(AppRoutes.foodDetail, arguments: food),
                          );
                        },
                        childCount: foods.length,
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),

          // Floating Cart Bar with safe area protection
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: const FloatingCartBar(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSortChip({
    required String label,
    IconData? icon,
    required bool isSelected,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : (isDark ? const Color(0xFF1E2638) : Colors.white),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 14,
                color: isSelected ? Colors.white : (isDark ? Colors.white70 : const Color(0xFF64748B)),
              ),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected
                    ? Colors.white
                    : (isDark ? Colors.white70 : const Color(0xFF475569)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyCategoryState(BuildContext context, bool isDark, String categoryName) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E2638) : const Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.restaurant_menu_rounded,
                size: 38,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'No Dishes in $categoryName Yet',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'The kitchen is cooking up fresh items for this menu category. Check back shortly!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white54 : const Color(0xFF64748B),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

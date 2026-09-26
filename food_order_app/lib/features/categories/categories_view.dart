import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_images.dart';
import '../../core/locale/translation_helper.dart';
import '../../core/widgets/floating_cart_bar.dart';
import '../../core/widgets/x_search_bar.dart';
import '../../domain/category/entities/category_entity.dart';
import '../../routes/app_routes.dart';
import 'categories_intent.dart';
import 'categories_store.dart';

class CategoriesView extends GetView<CategoriesStore> {
  const CategoriesView({super.key});

  CategoriesStore get store => Get.isRegistered<CategoriesStore>() ? controller : CategoriesStore.instance;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = Theme.of(context).scaffoldBackgroundColor;
    final currentStore = store;

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: scaffoldBg,
        surfaceTintColor: Colors.transparent,
        scrolledUnderElevation: 0,
        elevation: 0,
        title: Row(
          children: [
            Image.asset(AppImages.bitecraftLogo, height: 36),
            const SizedBox(width: 4),
            Text(
              'categoriesTitle'.trOr(context, 'Categories'),
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ],
        ),
        titleSpacing: 12,
      ),
      body: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Search Bar (Fixed - does not scroll)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: XSearchBar(
                  controller: currentStore.searchController,
                  hintText: 'Search categories or foods...',
                  onChanged: (val) => currentStore.onIntent(CategoriesSearchChanged(val)),
                ),
              ),

              // 2. Quick Discovery Filter Chips / Tabbar (Fixed - does not scroll with products)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Obx(() {
                    final selected = currentStore.state.value.selectedTag;
                    return Row(
                      children: [
                        _buildDiscoveryChip(
                          label: 'All',
                          icon: Icons.grid_view_rounded,
                          isSelected: selected == 'all',
                          onTap: () => currentStore.onIntent(const CategoriesTagSelected('all')),
                          isDark: isDark,
                        ),
                        const SizedBox(width: 8),
                        _buildDiscoveryChip(
                          label: '🔥 Trending',
                          isSelected: selected == 'trending',
                          onTap: () => currentStore.onIntent(const CategoriesTagSelected('trending')),
                          isDark: isDark,
                        ),
                        const SizedBox(width: 8),
                        _buildDiscoveryChip(
                          label: '⚡ Under 20m',
                          isSelected: selected == 'quick',
                          onTap: () => currentStore.onIntent(const CategoriesTagSelected('quick')),
                          isDark: isDark,
                        ),
                        const SizedBox(width: 8),
                        _buildDiscoveryChip(
                          label: r'💰 Budget (<$6)',
                          isSelected: selected == 'budget',
                          onTap: () => currentStore.onIntent(const CategoriesTagSelected('budget')),
                          isDark: isDark,
                        ),
                        const SizedBox(width: 8),
                        _buildDiscoveryChip(
                          label: '⭐ Top Rated',
                          isSelected: selected == 'top_rated',
                          onTap: () => currentStore.onIntent(const CategoriesTagSelected('top_rated')),
                          isDark: isDark,
                        ),
                      ],
                    );
                  }),
                ),
              ),

              // 3. Animated Divider / Shadow Line — Shows when scrolled, hides when at top
              Obx(() {
                final isScrolled = currentStore.state.value.isScrolled;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: isScrolled ? 1.0 : 0.0,
                  decoration: BoxDecoration(
                    boxShadow: isScrolled
                        ? [
                            BoxShadow(
                              color: isDark
                                  ? Colors.black.withValues(alpha: 0.4)
                                  : Colors.black.withValues(alpha: 0.08),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : [],
                    color: isDark
                        ? Colors.white.withValues(alpha: 0.06)
                        : Colors.black.withValues(alpha: 0.06),
                  ),
                );
              }),

              // 4. Products / Category Grid (Only this area scrolls!)
              Expanded(
                child: NotificationListener<ScrollNotification>(
                  onNotification: (info) {
                    final scrolledNow = info.metrics.pixels > 0;
                    if (currentStore.state.value.isScrolled != scrolledNow) {
                      currentStore.onIntent(CategoriesScrollChanged(scrolledNow));
                    }
                    return false;
                  },
                  child: RefreshIndicator(
                    color: AppColors.primary,
                    onRefresh: () async => currentStore.onIntent(const CategoriesRefreshData()),
                    child: Obx(() {
                      final list = currentStore.filteredCategories;

                      if (list.isEmpty) {
                        return CustomScrollView(
                          physics: const AlwaysScrollableScrollPhysics(
                            parent: BouncingScrollPhysics(),
                          ),
                          slivers: [
                            SliverFillRemaining(
                              hasScrollBody: false,
                              child: _buildEmptyState(context, isDark, currentStore.state.value.searchQuery),
                            ),
                          ],
                        );
                      }

                      return GridView.builder(
                        physics: const AlwaysScrollableScrollPhysics(
                          parent: BouncingScrollPhysics(),
                        ),
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 14,
                          mainAxisSpacing: 14,
                          childAspectRatio: 1.12,
                        ),
                        itemCount: list.length,
                        itemBuilder: (context, index) {
                          final cat = list[index];
                          final count = currentStore.getItemCount(cat);
                          return _buildCategoryCard(context, cat, count, isDark);
                        },
                      );
                    }),
                  ),
                ),
              ),
            ],
          ),

          // Floating Cart Bar
          const Positioned(
            left: 0,
            right: 0,
            bottom: 8,
            child: FloatingCartBar(),
          ),
        ],
      ),
    );
  }

  Widget _buildDiscoveryChip({
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
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
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

  Widget _buildCategoryCard(
    BuildContext context,
    CategoryEntity category,
    int itemCount,
    bool isDark,
  ) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Material(
          color: isDark ? const Color(0xFF1E2638) : Colors.white,
          child: InkWell(
            onTap: () {
              Get.toNamed(AppRoutes.categoryDetail, arguments: category);
            },
            child: Stack(
              fit: StackFit.expand,
              children: [
                // 1. Food Photography Background
                if (category.imageUrl.isNotEmpty)
                  Image.network(
                    category.imageUrl,
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, progress) {
                      if (progress == null) return child;
                      return Container(
                        color: isDark ? const Color(0xFF283044) : const Color(0xFFF1F5F9),
                        child: Center(
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.primary.withValues(alpha: 0.5),
                            value: progress.expectedTotalBytes != null
                                ? progress.cumulativeBytesLoaded / progress.expectedTotalBytes!
                                : null,
                          ),
                        ),
                      );
                    },
                    errorBuilder: (_, _, _) => Container(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      child: const Icon(Icons.restaurant_rounded, size: 36, color: AppColors.primary),
                    ),
                  )
                else
                  Container(
                    color: AppColors.primary.withValues(alpha: 0.15),
                    child: const Icon(Icons.restaurant_rounded, size: 36, color: AppColors.primary),
                  ),

                // 2. Double Gradient Overlay for clean readability
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.2),
                        Colors.black.withValues(alpha: 0.85),
                      ],
                      stops: const [0.3, 1.0],
                    ),
                  ),
                ),

                // 3. Category Info Overlay
                Positioned(
                  left: 12,
                  right: 12,
                  bottom: 12,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Title
                      Text(
                        category.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.2,
                          shadows: [
                            Shadow(color: Colors.black87, blurRadius: 6, offset: Offset(0, 1)),
                          ],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      // Item count pill and arrow
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.22),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '$itemCount items',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.85),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.arrow_forward_ios_rounded,
                              size: 9,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark, String query) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E2638) : const Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.search_off_rounded,
                size: 34,
                color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              query.isNotEmpty ? 'No matches for "$query"' : 'No Categories Found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Try searching for another food category like Burgers, Pizza, or Bakery.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12.5,
                color: isDark ? Colors.white54 : const Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

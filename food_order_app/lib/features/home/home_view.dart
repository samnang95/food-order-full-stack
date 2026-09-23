import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:food_order_app/core/constants/app_images.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/x_search_bar.dart';
import '../../core/theme/theme_store.dart';
import '../../core/db/local_db.dart';
import 'home_store.dart';
import 'home_intent.dart';
import 'widgets/category_chip_list.dart';
import 'widgets/food_card.dart';

class HomeView extends GetView<HomeStore> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isScrolled = ValueNotifier<bool>(false);

    return Scaffold(
      appBar: AppBar(
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Row(
          children: [
            Image.asset(AppImages.bitecraftLogo, height: 36),
            const SizedBox(width: 4),
            Text(
              "foodFeed".getString(context),
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ],
        ),
        titleSpacing: 12,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () async {
                final localization = FlutterLocalization.instance;
                String newLang = 'en';
                if (localization.currentLocale?.languageCode == 'en') {
                  newLang = 'km';
                }
                localization.translate(newLang);
                await LocalDB.setString('app_language', newLang);
              },
              child: const Icon(Icons.language),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () {
                Get.find<ThemeStore>().toggleTheme(context);
              },
              child: const Icon(Icons.brightness_6),
            ),
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Bar (Fixed - does not scroll)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: XSearchBar(
                onChanged: (query) {
                  controller.onIntent(HomeSearchChanged(query));
                },
              ),
            ),

            // Category Chips (Fixed vertically - does not scroll with products)
            Obx(() {
              final state = controller.state.value;
              if (state.categories.isEmpty) return const SizedBox.shrink();
              return Padding(
                padding: const EdgeInsets.only(top: 4, bottom: 12),
                child: CategoryChipList(
                  categories: state.categories,
                  selectedCategoryId: state.selectedCategoryId,
                  onCategorySelected: (id) {
                    controller.onIntent(HomeCategorySelected(id));
                  },
                ),
              );
            }),

            // Section Title (Fixed)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
              child: Obx(() {
                final state = controller.state.value;
                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      state.searchQuery.isNotEmpty
                          ? 'Search Results'
                          : state.selectedCategoryId.isEmpty
                              ? 'Popular Items'
                              : 'Items',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    if (!state.isLoading && state.foods.isNotEmpty)
                      Text(
                        '${state.foods.length} items',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? Colors.white54 : AppColors.subtitleColor,
                        ),
                      ),
                  ],
                );
              }),
            ),

            const SizedBox(height: 8),

            // Animated shadow line — appears when scrolled
            ValueListenableBuilder<bool>(
              valueListenable: isScrolled,
              builder: (context, scrolled, _) {
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: scrolled ? 1.0 : 0.0,
                  decoration: BoxDecoration(
                    boxShadow: scrolled
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
              },
            ),

            // Products (Only this area scrolls!)
            Expanded(
              child: NotificationListener<ScrollNotification>(
                onNotification: (notification) {
                  final scrolledNow = notification.metrics.pixels > 0;
                  if (isScrolled.value != scrolledNow) {
                    isScrolled.value = scrolledNow;
                  }
                  return false;
                },
                child: RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () async {
                    controller.onIntent(const HomeRefreshData());
                    // Wait a moment for the state to update
                    await Future.delayed(const Duration(milliseconds: 800));
                  },
                  child: Obx(() {
                    final state = controller.state.value;
                    return CustomScrollView(
                      physics: const AlwaysScrollableScrollPhysics(
                        parent: BouncingScrollPhysics(),
                      ),
                      slivers: [
                        // Content: Loading / Error / Empty / Food Grid
                        if (state.isLoading)
                          SliverToBoxAdapter(
                            child: _buildLoadingShimmer(isDark),
                          )
                        else if (state.errorMessage != null)
                          SliverFillRemaining(
                            hasScrollBody: false,
                            child: _buildErrorState(context, state.errorMessage!, isDark),
                          )
                        else if (state.foods.isEmpty)
                          SliverFillRemaining(
                            hasScrollBody: false,
                            child: _buildEmptyState(isDark),
                          )
                        else
                          SliverPadding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            sliver: SliverGrid(
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                                childAspectRatio: 0.62,
                              ),
                              delegate: SliverChildBuilderDelegate(
                                (context, index) {
                                  final food = state.foods[index];
                                  return FoodCard(
                                    food: food,
                                    onTap: () {
                                      // Future: navigate to food detail
                                    },
                                  );
                                },
                                childCount: state.foods.length,
                              ),
                            ),
                          ),

                        // Bottom padding
                        const SliverToBoxAdapter(child: SizedBox(height: 24)),
                      ],
                    );
                  }),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingShimmer(bool isDark) {
    final baseColor = isDark ? const Color(0xFF1E2638) : const Color(0xFFE5E7EB);
    final highlightColor = isDark ? const Color(0xFF283044) : const Color(0xFFF3F4F6);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.62,
        ),
        itemCount: 6,
        itemBuilder: (context, index) {
          return TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.0, end: 1.0),
            duration: Duration(milliseconds: 800 + (index * 150)),
            curve: Curves.easeInOut,
            builder: (context, value, child) {
              return AnimatedContainer(
                duration: const Duration(milliseconds: 600),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Color.lerp(baseColor, highlightColor, value),
                  border: Border.all(
                    color: isDark
                        ? const Color(0xFF2E3A52)
                        : AppColors.borderColor.withValues(alpha: 0.5),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 3,
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                          color: Color.lerp(baseColor, highlightColor, value),
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: Padding(
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            Container(
                              height: 12,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: Color.lerp(highlightColor, baseColor, value),
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                            Container(
                              height: 10,
                              width: 80,
                              decoration: BoxDecoration(
                                color: Color.lerp(highlightColor, baseColor, value),
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                            Container(
                              height: 14,
                              width: 50,
                              decoration: BoxDecoration(
                                color: Color.lerp(highlightColor, baseColor, value),
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String message, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.wifi_off_rounded,
              size: 64,
              color: isDark ? Colors.white24 : Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.white60 : AppColors.subtitleColor,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => controller.onIntent(const HomeLoadData()),
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.no_food_rounded,
              size: 64,
              color: isDark ? Colors.white24 : Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'No food items found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white60 : AppColors.neutral,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Try selecting a different category\nor adjusting your search',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white38 : AppColors.subtitleColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

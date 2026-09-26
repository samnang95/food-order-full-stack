import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/floating_cart_bar.dart';
import '../../routes/app_routes.dart';
import '../home/widgets/food_card.dart';
import '../main_navigation/main_nav_intent.dart';
import '../main_navigation/main_nav_store.dart';
import 'favorites_intent.dart';
import 'favorites_store.dart';

class FavoritesView extends GetView<FavoritesStore> {
  const FavoritesView({super.key});

  FavoritesStore get store => Get.isRegistered<FavoritesStore>() ? controller : Get.put(FavoritesStore());

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = Theme.of(context).scaffoldBackgroundColor;
    final bottomInset = MediaQuery.of(context).padding.bottom;
    final currentStore = store;

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: scaffoldBg,
        surfaceTintColor: Colors.transparent,
        scrolledUnderElevation: 0,
        elevation: 0,
        leading: Center(
            child: GestureDetector(
            onTap: () => Get.back(),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E2638) : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 16,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
          ),
        ),
        title: Obx(() {
          final count = currentStore.state.value.favoriteFoods.length;
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'My Favorites',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              if (count > 0) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$count',
                    style: const TextStyle(
                      color: Color(0xFFEF4444),
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ],
          );
        }),
        centerTitle: true,
        actions: [
          Obx(() {
            final hasItems = currentStore.state.value.favoriteFoods.isNotEmpty;
            if (!hasItems) return const SizedBox.shrink();

            return PopupMenuButton<String>(
              icon: Icon(
                Icons.more_vert_rounded,
                color: isDark ? Colors.white70 : AppColors.neutral,
              ),
              color: isDark ? const Color(0xFF1E2638) : Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              onSelected: (value) {
                if (value == 'add_all') {
                  currentStore.onIntent(const FavoritesAddAllToCart());
                } else if (value == 'clear_all') {
                  _showClearConfirmation(context, currentStore);
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'add_all',
                  child: Row(
                    children: [
                      Icon(Icons.shopping_bag_outlined, size: 20, color: AppColors.primary),
                      SizedBox(width: 10),
                      Text('Add All to Cart', style: TextStyle(fontSize: 13.5)),
                    ],
                  ),
                ),
                const PopupMenuDivider(),
                const PopupMenuItem(
                  value: 'clear_all',
                  child: Row(
                    children: [
                      Icon(Icons.delete_outline_rounded, size: 20, color: Color(0xFFEF4444)),
                      SizedBox(width: 10),
                      Text(
                        'Clear Wishlist',
                        style: TextStyle(fontSize: 13.5, color: Color(0xFFEF4444)),
                      ),
                    ],
                  ),
                ),
              ],
            );
          }),
        ],
      ),
      body: Stack(
        children: [
          Obx(() {
            final state = currentStore.state.value;
            final allFavorites = state.favoriteFoods;

            if (allFavorites.isEmpty) {
              return _buildEmptyState(context, isDark);
            }

            final filteredList = state.filteredFoods;
            final categories = state.availableCategories;

            return CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              slivers: [
                // 1. Search Bar within Favorites
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
                    child: Container(
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E2638) : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: TextField(
                        controller: currentStore.searchController,
                        onChanged: (val) => currentStore.onIntent(FavoritesSearchChanged(val)),
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark ? Colors.white : AppColors.neutral,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Search your favorites...',
                          hintStyle: TextStyle(
                            fontSize: 14,
                            color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                          ),
                          prefixIcon: Icon(
                            Icons.search_rounded,
                            size: 22,
                            color: isDark ? Colors.white54 : const Color(0xFF64748B),
                          ),
                          suffixIcon: Obx(() {
                            if (currentStore.state.value.searchQuery.isEmpty) {
                              return const SizedBox.shrink();
                            }
                            return IconButton(
                              icon: const Icon(Icons.close_rounded, size: 18),
                              onPressed: () => currentStore.onIntent(const FavoritesClearSearch()),
                            );
                          }),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        ),
                      ),
                    ),
                  ),
                ),

                // 2. Category Filter Chips (if multiple categories present)
                if (categories.length > 2)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Obx(() {
                          final selected = currentStore.state.value.selectedCategory;
                          return Row(
                            children: categories.map((cat) {
                              final isSelected = selected == cat;
                              final label = cat == 'all' ? 'All' : cat;
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: GestureDetector(
                                  onTap: () => currentStore.onIntent(FavoritesCategorySelected(cat)),
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
                                    ),
                                    child: Text(
                                      label,
                                      style: TextStyle(
                                        fontSize: 12.5,
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                        color: isSelected
                                            ? Colors.white
                                            : (isDark ? Colors.white70 : const Color(0xFF475569)),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          );
                        }),
                      ),
                    ),
                  ),

                // 3. Sort Selector Bar
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${filteredList.length} ${filteredList.length == 1 ? "dish" : "dishes"}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white54 : AppColors.subtitleColor,
                          ),
                        ),
                        // Quick Sort Pill Menu
                        Obx(() {
                          final sort = currentStore.state.value.selectedSort;
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF1E2638) : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
                              ),
                            ),
                            child: DropdownButtonHideUnderline(
                              child: DropdownButton<String>(
                                value: sort,
                                icon: const Icon(Icons.arrow_drop_down_rounded, size: 20),
                                isDense: true,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? Colors.white : AppColors.neutral,
                                ),
                                dropdownColor: isDark ? const Color(0xFF1E2638) : Colors.white,
                                items: const [
                                  DropdownMenuItem(
                                    value: 'recent',
                                    child: Text('Recently Added'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'price_asc',
                                    child: Text('Price: Low to High'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'price_desc',
                                    child: Text('Price: High to Low'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'name_asc',
                                    child: Text('Name (A-Z)'),
                                  ),
                                ],
                                onChanged: (val) {
                                  if (val != null) {
                                    currentStore.onIntent(FavoritesSortChanged(val));
                                  }
                                },
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ),

                // 4. Favorites Grid
                if (filteredList.isEmpty)
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: _buildNoMatchesState(isDark, currentStore.state.value.searchQuery),
                  )
                else
                  SliverPadding(
                    padding: EdgeInsets.fromLTRB(16, 0, 16, bottomInset + 104),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.62,
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final food = filteredList[index];
                          return FoodCard(
                            food: food,
                            onTap: () => Get.toNamed(AppRoutes.foodDetail, arguments: food),
                          );
                        },
                        childCount: filteredList.length,
                      ),
                    ),
                  ),
              ],
            );
          }),

          // Sticky Floating Cart Bar with safe area protection
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

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.favorite_rounded,
                size: 46,
                color: Color(0xFFEF4444),
              ),
            ),
            const SizedBox(height: 22),
            Text(
              'Your Wishlist is Empty',
              style: TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Save your all-time favorite dishes by tapping the heart icon on any meal for quick ordering.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white54 : const Color(0xFF64748B),
                height: 1.45,
              ),
            ),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              onPressed: () {
                Get.back();
                if (Get.isRegistered<MainNavStore>()) {
                  Get.find<MainNavStore>().onIntent(const ChangeTabIntent(0));
                }
              },
              icon: const Icon(Icons.restaurant_menu_rounded, size: 18),
              label: const Text(
                'Explore Food Feed',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoMatchesState(bool isDark, String query) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search_off_rounded,
              size: 40,
              color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
            ),
            const SizedBox(height: 12),
            Text(
              'No favorites matching "$query"',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showClearConfirmation(BuildContext context, FavoritesStore currentStore) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Get.dialog(
      AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1E2638) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Clear all favorites?'),
        content: const Text('Are you sure you want to remove all saved items from your wishlist?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text(
              'Cancel',
              style: TextStyle(color: isDark ? Colors.white70 : AppColors.subtitleColor),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              currentStore.onIntent(const FavoritesClearAll());
              Get.back();
            },
            child: const Text('Clear All'),
          ),
        ],
      ),
    );
  }
}

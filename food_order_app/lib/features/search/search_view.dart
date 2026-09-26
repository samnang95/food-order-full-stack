import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/widgets/floating_cart_bar.dart';
import 'search_intent.dart';
import 'search_store.dart';
import 'widgets/widgets.dart';

class SearchView extends GetView<SearchStore> {
  final bool autoFocus;

  const SearchView({
    super.key,
    this.autoFocus = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF141A29) : const Color(0xFFF8FAFC);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // Top Search Header Bar
                SearchHeaderBar(
                  store: controller,
                  autoFocus: autoFocus,
                ),

                // Main Content Body
                Expanded(
                  child: Obx(() {
                    final state = controller.state.value;

                    // 1. Loading State
                    if (state.isLoading) {
                      return const SearchShimmerLoading();
                    }

                    // 2. Error State
                    if (state.errorMessage != null) {
                      return _buildErrorState(context, isDark, state.errorMessage!);
                    }

                    final isSearching = state.query.trim().isNotEmpty || state.hasActiveFilter;
                    final results = state.results;

                    // 3. Discovery Mode (Initial state before typing or filtering)
                    if (!isSearching) {
                      return RefreshIndicator(
                        onRefresh: () async => controller.onIntent(const SearchRefreshIntent()),
                        color: AppColors.primary,
                        child: SingleChildScrollView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                          padding: const EdgeInsets.only(bottom: 100),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              RecentSearchesSection(store: controller),
                              SearchEmptyState(store: controller),
                            ],
                          ),
                        ),
                      );
                    }

                    // 4. No Results Found State
                    if (results.isEmpty) {
                      return RefreshIndicator(
                        onRefresh: () async => controller.onIntent(const SearchRefreshIntent()),
                        color: AppColors.primary,
                        child: SingleChildScrollView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                          padding: const EdgeInsets.only(bottom: 100),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              RecentSearchesSection(store: controller),
                              SearchEmptyState(store: controller),
                            ],
                          ),
                        ),
                      );
                    }

                    // 5. Results List
                    return CustomScrollView(
                      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                      slivers: [
                        // Results summary header
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 6),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Found ${results.length} ${results.length == 1 ? "dish" : "dishes"}',
                                  style: TextStyle(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w600,
                                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                                  ),
                                ),
                                if (state.hasActiveFilter)
                                  GestureDetector(
                                    onTap: () => controller.onIntent(const SearchResetFilterIntent()),
                                    child: const Text(
                                      'Reset filters',
                                      style: TextStyle(
                                        fontSize: 12.5,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),

                        // Food results list
                        SliverPadding(
                          padding: const EdgeInsets.only(bottom: 100),
                          sliver: SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final food = results[index];
                                return SearchFoodTile(
                                  food: food,
                                  store: controller,
                                );
                              },
                              childCount: results.length,
                            ),
                          ),
                        ),
                      ],
                    );
                  }),
                ),
              ],
            ),

            // Sticky Floating Cart Bar
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
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, bool isDark, String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline_rounded,
                size: 38,
                color: Colors.redAccent,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Failed to load dishes',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => controller.onIntent(const SearchRefreshIntent()),
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Try Again'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

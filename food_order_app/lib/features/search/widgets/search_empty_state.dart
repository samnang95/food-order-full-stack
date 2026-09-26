import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../search_intent.dart';
import '../search_store.dart';

class SearchEmptyState extends StatelessWidget {
  final SearchStore store;

  const SearchEmptyState({
    super.key,
    required this.store,
  });

  static const List<Map<String, String>> _popularSuggestions = [
    {'emoji': '🍔', 'tag': 'Burger'},
    {'emoji': '🍕', 'tag': 'Pizza'},
    {'emoji': '🥗', 'tag': 'Salad'},
    {'emoji': '🍜', 'tag': 'Noodles'},
    {'emoji': '🍣', 'tag': 'Sushi'},
    {'emoji': '🍰', 'tag': 'Dessert'},
    {'emoji': '☕', 'tag': 'Coffee'},
    {'emoji': '🍟', 'tag': 'Fries'},
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = store.state.value;
    final hasQuery = state.query.trim().isNotEmpty;
    final hasFilter = state.hasActiveFilter;

    final isNoResults = hasQuery || hasFilter;

    if (!isNoResults) {
      // Discovery state with suggested keywords
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.restaurant_menu_rounded,
                size: 40,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'Discover Delicious Food',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Search by dish name, description, or ingredients to find your cravings.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13.5,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 28),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Popular Searches',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppColors.neutral,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 10,
              children: _popularSuggestions.map((item) {
                final tag = item['tag']!;
                final emoji = item['emoji']!;
                final chipBg = isDark ? const Color(0xFF1E2638) : const Color(0xFFF1F5F9);
                final borderColor = isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0);

                return InkWell(
                  onTap: () => store.onIntent(SearchSelectRecentQueryIntent(tag)),
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: chipBg,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: borderColor),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(emoji, style: const TextStyle(fontSize: 14)),
                        const SizedBox(width: 6),
                        Text(
                          tag,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isDark ? Colors.white : const Color(0xFF334155),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      );
    }

    // No Results Found State
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: (isDark ? const Color(0xFF2E3A52) : const Color(0xFFF1F5F9)),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.search_off_rounded,
                size: 40,
                color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'No dishes found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              hasQuery
                  ? 'No results matched "$hasQuery". Try checking for typos or using different keywords.'
                  : 'No dishes matched your selected filter criteria.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13.5,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (hasFilter) ...[
                  OutlinedButton.icon(
                    onPressed: () => store.onIntent(const SearchResetFilterIntent()),
                    icon: const Icon(Icons.refresh_rounded, size: 16),
                    label: const Text('Reset Filters'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                if (hasQuery)
                  ElevatedButton.icon(
                    onPressed: () => store.onIntent(const SearchClearQueryIntent()),
                    icon: const Icon(Icons.close_rounded, size: 16),
                    label: const Text('Clear Search'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

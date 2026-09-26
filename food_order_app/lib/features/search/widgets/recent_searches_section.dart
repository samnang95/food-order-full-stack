import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../search_intent.dart';
import '../search_store.dart';

class RecentSearchesSection extends StatelessWidget {
  final SearchStore store;

  const RecentSearchesSection({
    super.key,
    required this.store,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Obx(() {
      final recent = store.state.value.recentSearches;
      if (recent.isEmpty) return const SizedBox.shrink();

      return Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.history_rounded,
                      size: 18,
                      color: isDark ? Colors.white70 : const Color(0xFF64748B),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Recent Searches',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : AppColors.neutral,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => store.onIntent(const SearchClearAllRecentIntent()),
                  child: Text(
                    'Clear All',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: recent.map((query) {
                return _buildChip(context, query, isDark);
              }).toList(),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildChip(BuildContext context, String query, bool isDark) {
    final chipBg = isDark ? const Color(0xFF1E2638) : const Color(0xFFF1F5F9);
    final borderColor = isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0);

    return InkWell(
      onTap: () => store.onIntent(SearchSelectRecentQueryIntent(query)),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: chipBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderColor),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              query,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: isDark ? Colors.white : const Color(0xFF334155),
              ),
            ),
            const SizedBox(width: 6),
            GestureDetector(
              onTap: () => store.onIntent(SearchRemoveRecentQueryIntent(query)),
              child: Icon(
                Icons.close_rounded,
                size: 14,
                color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

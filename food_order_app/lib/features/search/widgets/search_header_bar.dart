import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../search_intent.dart';
import '../search_store.dart';
import 'search_filter_bottom_sheet.dart';

class SearchHeaderBar extends StatefulWidget {
  final SearchStore store;
  final bool autoFocus;

  const SearchHeaderBar({
    super.key,
    required this.store,
    this.autoFocus = true,
  });

  @override
  State<SearchHeaderBar> createState() => _SearchHeaderBarState();
}

class _SearchHeaderBarState extends State<SearchHeaderBar> {
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    widget.store.searchFocusNode.addListener(_handleFocusChange);
  }

  @override
  void dispose() {
    widget.store.searchFocusNode.removeListener(_handleFocusChange);
    super.dispose();
  }

  void _handleFocusChange() {
    if (mounted) {
      setState(() {
        _isFocused = widget.store.searchFocusNode.hasFocus;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final defaultBorder = isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0);
    final focusedBorder = AppColors.primary.withValues(alpha: 0.6);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
      child: Row(
        children: [
          // 1. Back Button (48x48 rounded squircle matching search bar)
          Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            child: InkWell(
              onTap: () => Get.back(),
              borderRadius: BorderRadius.circular(16),
              child: Ink(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: defaultBorder),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 18,
                  color: isDark ? Colors.white : AppColors.neutral,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),

          // 2. Search Input Box (48px height, zero internal filled bleeding)
          Expanded(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              height: 48,
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _isFocused ? focusedBorder : defaultBorder,
                  width: _isFocused ? 1.5 : 1.0,
                ),
                boxShadow: [
                  BoxShadow(
                    color: _isFocused
                        ? AppColors.primary.withValues(alpha: 0.1)
                        : Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                    blurRadius: _isFocused ? 10 : 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Row(
                children: [
                  const Icon(
                    Icons.search_rounded,
                    size: 22,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: widget.store.textController,
                      focusNode: widget.store.searchFocusNode,
                      autofocus: widget.autoFocus,
                      style: TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w500,
                        color: isDark ? Colors.white : AppColors.neutral,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Search food, drinks, burger...',
                        hintStyle: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                        ),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        disabledBorder: InputBorder.none,
                        errorBorder: InputBorder.none,
                        filled: false,
                        fillColor: Colors.transparent,
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onChanged: (val) {
                        widget.store.onIntent(SearchQueryChangedIntent(val));
                      },
                    ),
                  ),
                  Obx(() {
                    final hasText = widget.store.state.value.query.isNotEmpty;
                    if (!hasText) return const SizedBox.shrink();
                    return GestureDetector(
                      onTap: () => widget.store.onIntent(const SearchClearQueryIntent()),
                      child: Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          color: isDark
                              ? const Color(0xFF2E3A52)
                              : const Color(0xFFE2E8F0),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.close_rounded,
                          size: 13,
                          color: isDark ? Colors.white70 : const Color(0xFF64748B),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),

          // 3. Filter Button (48x48 with active state highlight & badge)
          Obx(() {
            final activeCount = widget.store.state.value.activeFilterCount;
            final hasFilter = activeCount > 0;

            return Stack(
              clipBehavior: Clip.none,
              children: [
                Material(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                  child: InkWell(
                    onTap: () => SearchFilterBottomSheet.show(context, widget.store),
                    borderRadius: BorderRadius.circular(16),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: hasFilter ? AppColors.primary : cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: hasFilter ? AppColors.primary : defaultBorder,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: hasFilter
                                ? AppColors.primary.withValues(alpha: 0.35)
                                : Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                            blurRadius: hasFilter ? 10 : 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.tune_rounded,
                        size: 20,
                        color: hasFilter
                            ? Colors.white
                            : (isDark ? Colors.white70 : const Color(0xFF475569)),
                      ),
                    ),
                  ),
                ),
                if (hasFilter)
                  Positioned(
                    top: -4,
                    right: -4,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 3),
                      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(9),
                        border: Border.all(color: AppColors.primary, width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.15),
                            blurRadius: 4,
                            offset: const Offset(0, 1),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Text(
                          '$activeCount',
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            height: 1,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            );
          }),
        ],
      ),
    );
  }
}

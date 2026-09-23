import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../constants/app_colors.dart';

class XSearchBar extends StatelessWidget {
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final String? hintText;
  final bool readOnly;
  final VoidCallback? onTap;

  const XSearchBar({
    super.key,
    this.controller,
    this.onChanged,
    this.hintText,
    this.readOnly = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textController = controller ?? TextEditingController();
    final hasText = textController.text.isNotEmpty.obs;

    final bgColor = isDark ? const Color(0xFF1E2638) : const Color(0xFFF4F1EE);
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.08)
        : AppColors.primary.withValues(alpha: 0.12);
    final iconColor = isDark ? Colors.white38 : const Color(0xFF9E8E82);
    final hintColor = isDark ? Colors.white30 : const Color(0xFFA49589);
    final textColor = isDark ? Colors.white : AppColors.neutral;

    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Row(
        children: [
          const SizedBox(width: 14),
          Obx(
            () => Icon(
              Icons.search_rounded,
              color: hasText.value ? AppColors.primary : iconColor,
              size: 22,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: textController,
              readOnly: readOnly,
              onTap: onTap,
              onChanged: (value) {
                hasText.value = value.isNotEmpty;
                onChanged?.call(value);
              },
              decoration: InputDecoration(
                hintText: hintText ?? 'Search food, drinks...',
                hintStyle: TextStyle(
                  color: hintColor,
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                filled: false,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
              style: TextStyle(
                color: textColor,
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          // Clear button — appears when typing
          Obx(
            () => AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              transitionBuilder: (child, animation) => FadeTransition(
                opacity: animation,
                child: ScaleTransition(scale: animation, child: child),
              ),
              child: hasText.value
                  ? GestureDetector(
                      key: const ValueKey('clear'),
                      onTap: () {
                        textController.clear();
                        hasText.value = false;
                        onChanged?.call('');
                      },
                      child: Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: isDark
                                ? Colors.white.withValues(alpha: 0.1)
                                : Colors.black.withValues(alpha: 0.06),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.close_rounded,
                            size: 14,
                            color: isDark
                                ? Colors.white54
                                : AppColors.subtitleColor,
                          ),
                        ),
                      ),
                    )
                  : const SizedBox.shrink(key: ValueKey('empty')),
            ),
          ),
        ],
      ),
    );
  }
}

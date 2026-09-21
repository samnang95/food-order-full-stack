import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/locale_store.dart';

/// Top Bar for the Login screen with brand pill and language switch toggle.
class LoginTopBar extends StatelessWidget {
  const LoginTopBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Brand Pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.08),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.tertiary,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              const Text(
                'BiteCraft Express',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.neutral,
                ),
              ),
            ],
          ),
        ),

        // Language Switcher Toggle
        Obx(() {
          final currentCode = Get.find<LocaleStore>().locale.value.languageCode;
          return Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey.shade300),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                LoginLangButton(
                  label: 'EN',
                  isSelected: currentCode == 'en',
                  onTap: () => Get.find<LocaleStore>().changeLocale('en'),
                ),
                LoginLangButton(
                  label: 'ខ្មែរ',
                  isSelected: currentCode == 'km',
                  onTap: () => Get.find<LocaleStore>().changeLocale('km'),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}

/// Language selection pill button
class LoginLangButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const LoginLangButton({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : Colors.grey.shade600,
          ),
        ),
      ),
    );
  }
}

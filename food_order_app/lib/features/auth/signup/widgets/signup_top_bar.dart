import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/locale_store.dart';

/// Top Bar for SignUp with back button, brand pill, and language toggle.
class SignUpTopBar extends StatelessWidget {
  const SignUpTopBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Back Button & Brand Pill
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            InkWell(
              onTap: () => Get.back(),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 16,
                  color: AppColors.neutral,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
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
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      color: AppColors.tertiary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'BiteCraft',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.neutral,
                    ),
                  ),
                ],
              ),
            ),
          ],
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
                _buildLangButton(
                  label: 'EN',
                  isSelected: currentCode == 'en',
                  onTap: () => Get.find<LocaleStore>().changeLocale('en'),
                ),
                _buildLangButton(
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

  Widget _buildLangButton({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
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

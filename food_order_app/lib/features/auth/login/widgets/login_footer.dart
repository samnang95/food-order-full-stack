import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../routes/app_routes.dart';

/// Footer widget with sign up navigation link and secure encryption badge.
class LoginFooter extends StatelessWidget {
  const LoginFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'dontHaveAccount'.getString(context),
              style: const TextStyle(
                color: AppColors.subtitleColor,
                fontSize: 14,
              ),
            ),
            const SizedBox(width: 4),
            TextButton(
              onPressed: () => Get.toNamed(AppRoutes.signUp),
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(
                'signUp'.getString(context),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.lock_outline_rounded, size: 13, color: AppColors.tertiary),
            const SizedBox(width: 5),
            Text(
              'secureEncryption'.getString(context),
              style: const TextStyle(
                color: AppColors.subtitleColor,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

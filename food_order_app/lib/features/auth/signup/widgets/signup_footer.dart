import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../routes/app_routes.dart';

/// Footer widget with navigation to Login and SSL encryption badge.
class SignUpFooter extends StatelessWidget {
  const SignUpFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'alreadyHaveAccount'.getString(context),
              style: const TextStyle(
                color: AppColors.subtitleColor,
                fontSize: 14,
              ),
            ),
            const SizedBox(width: 4),
            TextButton(
              onPressed: () {
                if (Navigator.of(context).canPop()) {
                  Get.back();
                } else {
                  Get.offNamed(AppRoutes.login);
                }
              },
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(
                'signIn'.getString(context),
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

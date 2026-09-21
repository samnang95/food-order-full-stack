import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_images.dart';

/// Hero Section with Logo, Title, and Subtitle for Login.
class LoginHeroHeader extends StatelessWidget {
  const LoginHeroHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.18),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          padding: const EdgeInsets.all(10),
          child: Image.asset(AppImages.bitecraftLogo, fit: BoxFit.contain),
        ),
        const SizedBox(height: 18),
        Text(
          'welcomeBack'.getString(context),
          style: const TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: AppColors.neutral,
            letterSpacing: -0.5,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 6),
        Text(
          'signInDesc'.getString(context),
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.subtitleColor,
            fontWeight: FontWeight.normal,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

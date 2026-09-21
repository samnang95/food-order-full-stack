import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_images.dart';

/// Hero Section for SignUp with Logo, Title, and Subtitle.
class SignUpHeroHeader extends StatelessWidget {
  const SignUpHeroHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.18),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          padding: const EdgeInsets.all(8),
          child: Image.asset(AppImages.bitecraftLogo, fit: BoxFit.contain),
        ),
        const SizedBox(height: 16),
        Text(
          'createAccount'.getString(context),
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
          'signUpDesc'.getString(context),
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.subtitleColor,
            fontWeight: FontWeight.normal,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';

import '../../../../core/constants/app_colors.dart';

/// Promotional banner badge for SignUp with welcome offer.
class SignUpPromoBadge extends StatelessWidget {
  const SignUpPromoBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.center,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF7ED),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.25)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(
              child: Text(
                'promoSignUp'.getString(context),
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFC2410C),
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

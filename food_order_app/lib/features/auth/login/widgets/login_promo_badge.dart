import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';

/// Promotional banner badge displaying perks and points offer.
class LoginPromoBadge extends StatelessWidget {
  const LoginPromoBadge({super.key});

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
          children: const [
            Text('🔥', style: TextStyle(fontSize: 14)),
            SizedBox(width: 8),
            Flexible(
              child: Text(
                'Earn 2x Spice Points on your next order',
                style: TextStyle(
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

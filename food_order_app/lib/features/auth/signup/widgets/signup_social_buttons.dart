import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../core/constants/app_colors.dart';
import '../signup_intent.dart';
import '../signup_store.dart';

/// Social signup buttons (Google & Apple) for SignUp.
class SignUpSocialButtons extends StatelessWidget {
  final SignUpStore? controller;

  const SignUpSocialButtons({super.key, this.controller});

  @override
  Widget build(BuildContext context) {
    final signUpStore = controller ??
        (Get.isRegistered<SignUpStore>() ? Get.find<SignUpStore>() : null);

    return Row(
      children: [
        // Google Button
        Expanded(
          child: OutlinedButton(
            onPressed: () {
              if (signUpStore != null) {
                signUpStore.onIntent(const SignUpGoogleSubmit());
              }
            },
            style: OutlinedButton.styleFrom(
              backgroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              side: BorderSide(color: Colors.grey.shade200),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.g_mobiledata_rounded, color: Colors.redAccent, size: 28),
                SizedBox(width: 4),
                Text(
                  'Google',
                  style: TextStyle(
                    color: AppColors.neutral,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 14),

        // Apple Button
        Expanded(
          child: OutlinedButton(
            onPressed: () {
              if (signUpStore != null) {
                signUpStore.onIntent(const SignUpAppleSubmit());
              }
            },
            style: OutlinedButton.styleFrom(
              backgroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              side: BorderSide(color: Colors.grey.shade200),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.apple_rounded, color: Colors.black, size: 22),
                SizedBox(width: 6),
                Text(
                  'Apple',
                  style: TextStyle(
                    color: AppColors.neutral,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

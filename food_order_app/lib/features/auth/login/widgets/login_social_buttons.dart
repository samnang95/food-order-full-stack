import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../core/constants/app_colors.dart';
import '../login_intent.dart';
import '../login_store.dart';

/// Social login buttons (Google & Apple) for the login screen.
class LoginSocialButtons extends StatelessWidget {
  final LoginStore? controller;

  const LoginSocialButtons({super.key, this.controller});

  @override
  Widget build(BuildContext context) {
    final loginStore = controller ??
        (Get.isRegistered<LoginStore>() ? Get.find<LoginStore>() : null);

    return Row(
      children: [
        // Google Button
        Expanded(
          child: OutlinedButton(
            onPressed: () {
              if (loginStore != null) {
                loginStore.onIntent(const LoginGoogleSubmit());
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
              if (loginStore != null) {
                loginStore.onIntent(const LoginAppleSubmit());
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

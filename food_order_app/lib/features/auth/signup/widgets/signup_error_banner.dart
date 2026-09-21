import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../signup_intent.dart';
import '../signup_store.dart';

/// Error banner widget that smoothly appears when a signup error occurs.
class SignUpErrorBanner extends StatelessWidget {
  final SignUpStore? controller;

  const SignUpErrorBanner({
    super.key,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    final signUpController = controller ?? Get.find<SignUpStore>();
    return Obx(() {
      final error = signUpController.state.value.errorMessage;
      if (error == null || error.isEmpty) return const SizedBox.shrink();

      return AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        margin: const EdgeInsets.only(bottom: 18),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFFECACA)),
          boxShadow: [
            BoxShadow(
              color: Colors.red.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.error_outline_rounded, color: Color(0xFFDC2626), size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                error,
                style: const TextStyle(
                  color: Color(0xFFB91C1C),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  height: 1.3,
                ),
              ),
            ),
            GestureDetector(
              onTap: () => signUpController.onIntent(const SignUpClearError()),
              child: const Icon(Icons.close_rounded, color: Color(0xFF991B1B), size: 18),
            ),
          ],
        ),
      );
    });
  }
}

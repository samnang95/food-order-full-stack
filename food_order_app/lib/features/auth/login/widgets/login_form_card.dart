import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';

import '../../../../core/constants/app_colors.dart';
import '../login_intent.dart';
import '../login_store.dart';

/// Main card containing the username, password input fields, remember me toggle,
/// forgot password action, and the sign in CTA button using `GetView<LoginStore>`.
class LoginFormCard extends GetView<LoginStore> {
  const LoginFormCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Username / Email Label
          Text(
            'usernameEmail'.getString(context),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.neutral,
            ),
          ),
          const SizedBox(height: 8),

          // Username Input
          TextFormField(
            controller: controller.usernameController,
            style: const TextStyle(
              color: AppColors.neutral,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            cursorColor: AppColors.primary,
            textInputAction: TextInputAction.next,
            onChanged: (value) => controller.onIntent(LoginUsernameChanged(value)),
            decoration: InputDecoration(
              hintText: 'enterUsernameHint'.getString(context),
              hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
              prefixIcon: const Icon(Icons.person_outline_rounded, color: AppColors.subtitleColor, size: 20),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade200),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.shade200),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
          ),

          const SizedBox(height: 18),

          // Password Label
          Text(
            'password'.getString(context),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.neutral,
            ),
          ),
          const SizedBox(height: 8),

          // Password Input with Visibility Toggle
          Obx(() {
            final isVisible = controller.state.value.isPasswordVisible;
            return TextFormField(
              controller: controller.passwordController,
              style: const TextStyle(
                color: AppColors.neutral,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
              cursorColor: AppColors.primary,
              obscureText: !isVisible,
              textInputAction: TextInputAction.done,
              onFieldSubmitted: (_) => controller.onIntent(const LoginSubmit()),
              onChanged: (value) => controller.onIntent(LoginPasswordChanged(value)),
              decoration: InputDecoration(
                hintText: 'enterPasswordHint'.getString(context),
                hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.subtitleColor, size: 20),
                suffixIcon: IconButton(
                  icon: Icon(
                    isVisible ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                    color: AppColors.subtitleColor,
                    size: 20,
                  ),
                  onPressed: () => controller.onIntent(const LoginTogglePasswordVisibility()),
                ),
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                ),
              ),
            );
          }),

          const SizedBox(height: 14),

          // Remember Me & Forgot Password Row
          Obx(() {
            final isRemember = controller.state.value.rememberMe;
            return Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: GestureDetector(
                    onTap: () => controller.onIntent(LoginToggleRememberMe(!isRemember)),
                    behavior: HitTestBehavior.opaque,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          width: 20,
                          height: 20,
                          child: Checkbox(
                            value: isRemember,
                            onChanged: (val) => controller.onIntent(LoginToggleRememberMe(val ?? true)),
                            activeColor: AppColors.primary,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                            side: BorderSide(color: Colors.grey.shade400, width: 1.5),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            'rememberMe'.getString(context),
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.subtitleColor,
                              fontWeight: FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                TextButton(
                  onPressed: () {
                    Get.snackbar(
                      'Forgot Password',
                      'Please contact your BiteCraft administrator to reset credentials.',
                      snackPosition: SnackPosition.BOTTOM,
                      margin: const EdgeInsets.all(16),
                      borderRadius: 12,
                      backgroundColor: AppColors.neutral,
                      colorText: Colors.white,
                    );
                  },
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Text(
                    'forgotPassword'.getString(context),
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            );
          }),

          const SizedBox(height: 22),

          // Sign In CTA Button (with gradient and loading indicator)
          Obx(() {
            final state = controller.state.value;
            return Container(
              height: 50,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                gradient: const LinearGradient(
                  colors: [Color(0xFFEA580C), Color(0xFFF97316)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.35),
                    blurRadius: 14,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: ElevatedButton(
                onPressed: state.isLoading ? null : () => controller.onIntent(const LoginSubmit()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  disabledBackgroundColor: Colors.transparent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: state.isLoading
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'signIn'.getString(context),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward_rounded, size: 20, color: Colors.white),
                        ],
                      ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

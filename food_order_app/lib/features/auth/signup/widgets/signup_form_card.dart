import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';

import '../../../../core/constants/app_colors.dart';
import '../signup_intent.dart';
import '../signup_store.dart';

/// Form card for SignUp with Username, Email, Password, Confirm Password, Terms checkbox, and CTA button.
class SignUpFormCard extends StatefulWidget {
  final TextEditingController? usernameController;
  final TextEditingController? emailController;
  final TextEditingController? passwordController;
  final TextEditingController? confirmPasswordController;
  final SignUpStore? controller;

  const SignUpFormCard({
    super.key,
    this.usernameController,
    this.emailController,
    this.passwordController,
    this.confirmPasswordController,
    this.controller,
  });

  @override
  State<SignUpFormCard> createState() => _SignUpFormCardState();
}

class _SignUpFormCardState extends State<SignUpFormCard> {
  late final TextEditingController _usernameController;
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;
  late final TextEditingController _confirmPasswordController;
  late final bool _internalControllers;

  @override
  void initState() {
    super.initState();
    final store = widget.controller ?? Get.find<SignUpStore>();
    _internalControllers = widget.usernameController == null;
    _usernameController = widget.usernameController ??
        TextEditingController(text: store.state.value.username);
    _emailController = widget.emailController ??
        TextEditingController(text: store.state.value.email);
    _passwordController = widget.passwordController ??
        TextEditingController(text: store.state.value.password);
    _confirmPasswordController = widget.confirmPasswordController ??
        TextEditingController(text: store.state.value.confirmPassword);
  }

  @override
  void dispose() {
    if (_internalControllers) {
      _usernameController.dispose();
      _emailController.dispose();
      _passwordController.dispose();
      _confirmPasswordController.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final signUpController = widget.controller ?? Get.find<SignUpStore>();

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
          // 1. Username Field
          Text(
            'username'.getString(context),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.neutral,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _usernameController,
            style: const TextStyle(
              color: AppColors.neutral,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            cursorColor: AppColors.primary,
            textInputAction: TextInputAction.next,
            onChanged: (value) => signUpController.onIntent(SignUpUsernameChanged(value)),
            decoration: _inputDecoration(
              hintText: 'enterSignUpUsernameHint'.getString(context),
              prefixIcon: Icons.person_outline_rounded,
            ),
          ),

          const SizedBox(height: 16),

          // 2. Email Field
          Text(
            'email'.getString(context),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.neutral,
            ),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: _emailController,
            style: const TextStyle(
              color: AppColors.neutral,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            cursorColor: AppColors.primary,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            onChanged: (value) => signUpController.onIntent(SignUpEmailChanged(value)),
            decoration: _inputDecoration(
              hintText: 'enterEmailHint'.getString(context),
              prefixIcon: Icons.email_outlined,
            ),
          ),

          const SizedBox(height: 16),

          // 3. Password Field
          Text(
            'password'.getString(context),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.neutral,
            ),
          ),
          const SizedBox(height: 8),
          Obx(() {
            final isVisible = signUpController.state.value.isPasswordVisible;
            return TextFormField(
              controller: _passwordController,
              style: const TextStyle(
                color: AppColors.neutral,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
              cursorColor: AppColors.primary,
              obscureText: !isVisible,
              textInputAction: TextInputAction.next,
              onChanged: (value) => signUpController.onIntent(SignUpPasswordChanged(value)),
              decoration: _inputDecoration(
                hintText: 'createPasswordHint'.getString(context),
                prefixIcon: Icons.lock_outline_rounded,
                suffixIcon: IconButton(
                  icon: Icon(
                    isVisible ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                    color: AppColors.subtitleColor,
                    size: 20,
                  ),
                  onPressed: () => signUpController.onIntent(const SignUpTogglePasswordVisibility()),
                ),
              ),
            );
          }),

          const SizedBox(height: 16),

          // 4. Confirm Password Field
          Text(
            'confirmPassword'.getString(context),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: AppColors.neutral,
            ),
          ),
          const SizedBox(height: 8),
          Obx(() {
            final isVisible = signUpController.state.value.isConfirmPasswordVisible;
            return TextFormField(
              controller: _confirmPasswordController,
              style: const TextStyle(
                color: AppColors.neutral,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
              cursorColor: AppColors.primary,
              obscureText: !isVisible,
              textInputAction: TextInputAction.done,
              onFieldSubmitted: (_) => signUpController.onIntent(const SignUpSubmit()),
              onChanged: (value) => signUpController.onIntent(SignUpConfirmPasswordChanged(value)),
              decoration: _inputDecoration(
                hintText: 'enterConfirmPasswordHint'.getString(context),
                prefixIcon: Icons.lock_reset_rounded,
                suffixIcon: IconButton(
                  icon: Icon(
                    isVisible ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                    color: AppColors.subtitleColor,
                    size: 20,
                  ),
                  onPressed: () => signUpController.onIntent(const SignUpToggleConfirmPasswordVisibility()),
                ),
              ),
            );
          }),

          const SizedBox(height: 16),

          // 5. Terms & Conditions Agreement Checkbox
          Obx(() {
            final agree = signUpController.state.value.agreeToTerms;
            return GestureDetector(
              onTap: () => signUpController.onIntent(SignUpToggleAgreeToTerms(!agree)),
              behavior: HitTestBehavior.opaque,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: Checkbox(
                      value: agree,
                      onChanged: (val) => signUpController.onIntent(SignUpToggleAgreeToTerms(val ?? true)),
                      activeColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
                      side: BorderSide(color: Colors.grey.shade400, width: 1.5),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.subtitleColor,
                          height: 1.4,
                        ),
                        children: [
                          TextSpan(text: '${'agreeTerms'.getString(context)} '),
                          TextSpan(
                            text: 'termsOfService'.getString(context),
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          TextSpan(text: ' ${'andThe'.getString(context)} '),
                          TextSpan(
                            text: 'privacyPolicy'.getString(context),
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),

          const SizedBox(height: 22),

          // 6. Create Account CTA Button
          Obx(() {
            final state = signUpController.state.value;
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
                onPressed: state.isLoading ? null : () => signUpController.onIntent(const SignUpSubmit()),
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
                            'createAccount'.getString(context),
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

  InputDecoration _inputDecoration({
    required String hintText,
    required IconData prefixIcon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
      prefixIcon: Icon(prefixIcon, color: AppColors.subtitleColor, size: 20),
      suffixIcon: suffixIcon,
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
    );
  }
}

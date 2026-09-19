import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_images.dart';
import '../../core/locale/locale_store.dart';
import 'login_intent.dart';
import 'login_store.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final LoginStore controller = Get.find<LoginStore>();
  late final TextEditingController _usernameController;
  late final TextEditingController _passwordController;

  @override
  void initState() {
    super.initState();
    _usernameController = TextEditingController(text: controller.state.value.username);
    _passwordController = TextEditingController(text: controller.state.value.password);
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFFFF7ED), // Soft warm peach
              Color(0xFFF8FAFC), // Clean neutral
            ],
            stops: [0.0, 0.45],
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              return SingleChildScrollView(
                keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight - 32),
                  child: IntrinsicHeight(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Top Bar: Badge & Language Switcher
                        _buildTopBar(context),
                        
                        const SizedBox(height: 28),
                        
                        // Hero Logo & Greeting
                        _buildHeroHeader(context),
                        
                        const SizedBox(height: 24),
                        
                        // Promotional Tag
                        _buildPromoBadge(),
                        
                        const SizedBox(height: 24),
                        
                        // Error Alert Banner (Reactive)
                        _buildErrorBanner(),
                        
                        // Form Fields Card
                        _buildFormCard(context),
                        
                        const SizedBox(height: 24),
                        
                        // Divider
                        _buildOrDivider(context),
                        
                        const SizedBox(height: 20),
                        
                        // Social Logins (Google & Apple)
                        _buildSocialButtons(),
                        
                        const Spacer(),
                        const SizedBox(height: 28),
                        
                        // Sign Up Link & Security Badge
                        _buildFooter(context),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  /// Top Bar with brand pill and language switch toggle
  Widget _buildTopBar(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Brand Pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.08),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.tertiary,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              const Text(
                'BiteCraft Express',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: AppColors.neutral,
                ),
              ),
            ],
          ),
        ),

        // Language Switcher Toggle
        Obx(() {
          final currentCode = Get.find<LocaleStore>().locale.value.languageCode;
          return Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.grey.shade300),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildLangButton(
                  label: 'EN',
                  isSelected: currentCode == 'en',
                  onTap: () => Get.find<LocaleStore>().changeLocale('en'),
                ),
                _buildLangButton(
                  label: 'ខ្មែរ',
                  isSelected: currentCode == 'km',
                  onTap: () => Get.find<LocaleStore>().changeLocale('km'),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildLangButton({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : Colors.grey.shade600,
          ),
        ),
      ),
    );
  }

  /// Hero Section: Logo, Title, and Subtitle
  Widget _buildHeroHeader(BuildContext context) {
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

  /// Promotional banner
  Widget _buildPromoBadge() {
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

  /// Error Banner that smoothly appears when an error exists
  Widget _buildErrorBanner() {
    return Obx(() {
      final error = controller.state.value.errorMessage;
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
              onTap: () => controller.onIntent(const LoginClearError()),
              child: const Icon(Icons.close_rounded, color: Color(0xFF991B1B), size: 18),
            ),
          ],
        ),
      );
    });
  }

  /// Main Form Card containing inputs, remember me, and Sign In button
  Widget _buildFormCard(BuildContext context) {
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
            controller: _usernameController,
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
              controller: _passwordController,
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

  /// "or continue with" Divider
  Widget _buildOrDivider(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Container(height: 1, color: Colors.grey.shade200)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Text(
            'orContinueWith'.getString(context),
            style: TextStyle(
              color: Colors.grey.shade500,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(child: Container(height: 1, color: Colors.grey.shade200)),
      ],
    );
  }

  /// Social Login Buttons (Google & Apple)
  Widget _buildSocialButtons() {
    return Row(
      children: [
        // Google Button
        Expanded(
          child: OutlinedButton(
            onPressed: () {
              Get.snackbar(
                'Google Sign-In',
                'Google login flow will be available in the next release.',
                snackPosition: SnackPosition.BOTTOM,
                margin: const EdgeInsets.all(16),
                borderRadius: 12,
                backgroundColor: AppColors.neutral,
                colorText: Colors.white,
              );
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
              Get.snackbar(
                'Apple Sign-In',
                'Apple Sign-In will be available in the next release.',
                snackPosition: SnackPosition.BOTTOM,
                margin: const EdgeInsets.all(16),
                borderRadius: 12,
                backgroundColor: AppColors.neutral,
                colorText: Colors.white,
              );
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

  /// Footer with Sign Up navigation link and encryption trust badge
  Widget _buildFooter(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'dontHaveAccount'.getString(context),
              style: const TextStyle(
                color: AppColors.subtitleColor,
                fontSize: 14,
              ),
            ),
            const SizedBox(width: 4),
            TextButton(
              onPressed: () {
                Get.snackbar(
                  'Sign Up',
                  'Registration is open! Use testuser/test1234 or register via API.',
                  snackPosition: SnackPosition.BOTTOM,
                  margin: const EdgeInsets.all(16),
                  borderRadius: 12,
                  backgroundColor: AppColors.primary,
                  colorText: Colors.white,
                );
              },
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(
                'signUp'.getString(context),
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

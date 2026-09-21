import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../core/services/apple_auth_service.dart';
import '../../../core/services/google_auth_service.dart';
import '../../../domain/auth/apple/usecases/login_with_apple_usecase.dart';
import '../../../domain/auth/google/usecases/login_with_google_usecase.dart';
import '../../../domain/auth/signup/usecases/signup_usecase.dart';
import '../../../routes/app_routes.dart';
import 'signup_intent.dart';
import 'signup_model.dart';

class SignUpStore extends GetxController {
  final SignUpUseCase signUpUseCase;
  final LoginWithGoogleUseCase? loginWithGoogleUseCase;
  final GoogleAuthService? googleAuthService;
  final LoginWithAppleUseCase? loginWithAppleUseCase;
  final AppleAuthService? appleAuthService;

  SignUpStore({
    required this.signUpUseCase,
    this.loginWithGoogleUseCase,
    this.googleAuthService,
    this.loginWithAppleUseCase,
    this.appleAuthService,
  });

  final Rx<SignUpModel> state = const SignUpModel().obs;

  @override
  void onInit() {
    super.onInit();

    ever(state, (model) {
      if (model.isSuccess && Get.key.currentState != null) {
        try {
          if (Get.currentRoute != AppRoutes.home) {
            Get.offAllNamed(AppRoutes.home);
          }
        } catch (e) {
          debugPrint('⚠️ [SignUpStore] Navigation error: $e');
        }
      }
    });
  }

  void onIntent(SignUpIntent intent) {
    switch (intent) {
      case SignUpUsernameChanged(:final username):
        _onUsernameChanged(username);
      case SignUpEmailChanged(:final email):
        _onEmailChanged(email);
      case SignUpPasswordChanged(:final password):
        _onPasswordChanged(password);
      case SignUpConfirmPasswordChanged(:final confirmPassword):
        _onConfirmPasswordChanged(confirmPassword);
      case SignUpTogglePasswordVisibility():
        _onTogglePasswordVisibility();
      case SignUpToggleConfirmPasswordVisibility():
        _onToggleConfirmPasswordVisibility();
      case SignUpToggleAgreeToTerms(:final agree):
        _onToggleAgreeToTerms(agree);
      case SignUpClearError():
        _onClearError();
      case SignUpSubmit():
        _onSubmit();
      case SignUpGoogleSubmit():
        _onGoogleSubmit();
      case SignUpAppleSubmit():
        _onAppleSubmit();
    }
  }

  void _onUsernameChanged(String username) {
    state.value = state.value.copyWith(username: username, errorMessage: null);
  }

  void _onEmailChanged(String email) {
    state.value = state.value.copyWith(email: email, errorMessage: null);
  }

  void _onPasswordChanged(String password) {
    state.value = state.value.copyWith(password: password, errorMessage: null);
  }

  void _onConfirmPasswordChanged(String confirmPassword) {
    state.value = state.value.copyWith(confirmPassword: confirmPassword, errorMessage: null);
  }

  void _onTogglePasswordVisibility() {
    state.value = state.value.copyWith(isPasswordVisible: !state.value.isPasswordVisible);
  }

  void _onToggleConfirmPasswordVisibility() {
    state.value = state.value.copyWith(isConfirmPasswordVisible: !state.value.isConfirmPasswordVisible);
  }

  void _onToggleAgreeToTerms(bool agree) {
    state.value = state.value.copyWith(agreeToTerms: agree, errorMessage: null);
  }

  void _onClearError() {
    if (state.value.errorMessage != null) {
      state.value = state.value.copyWith(errorMessage: null);
    }
  }

  Future<void> _onSubmit() async {
    final username = state.value.username.trim();
    final email = state.value.email.trim();
    final password = state.value.password.trim();
    final confirmPassword = state.value.confirmPassword.trim();
    final agreeToTerms = state.value.agreeToTerms;

    // Client-side validations
    if (username.isEmpty) {
      state.value = state.value.copyWith(errorMessage: 'Please enter a username');
      return;
    }
    if (username.length < 3) {
      state.value = state.value.copyWith(errorMessage: 'Username must be at least 3 characters');
      return;
    }
    if (email.isEmpty) {
      state.value = state.value.copyWith(errorMessage: 'Please enter an email address');
      return;
    }
    if (!GetUtils.isEmail(email)) {
      state.value = state.value.copyWith(errorMessage: 'Please enter a valid email address');
      return;
    }
    if (password.isEmpty) {
      state.value = state.value.copyWith(errorMessage: 'Please enter a password');
      return;
    }
    if (password.length < 6) {
      state.value = state.value.copyWith(errorMessage: 'Password must be at least 6 characters');
      return;
    }
    if (password != confirmPassword) {
      state.value = state.value.copyWith(errorMessage: 'Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      state.value = state.value.copyWith(errorMessage: 'Please accept the Terms & Privacy Policy to continue');
      return;
    }

    debugPrint('🔐 [SignUpStore] Registering user: $username ($email)...');
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final user = await signUpUseCase.execute(
        username: username,
        email: email,
        password: password,
      );

      debugPrint('✅ [SignUpStore] Registration successful → user: ${user.username}');
      state.value = state.value.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      debugPrint('❌ [SignUpStore] Registration failed: $e');
      final rawError = e.toString().replaceAll('Exception: ', '');
      String displayError = rawError;

      if (rawError.contains('Connection refused') || rawError.contains('SocketException')) {
        displayError = 'Cannot connect to server. Please check your network or server status.';
      } else {
        try {
          final jsonStart = rawError.indexOf('{');
          if (jsonStart != -1) {
            final jsonStr = rawError.substring(jsonStart);
            final parsed = jsonDecode(jsonStr);
            if (parsed['message'] != null) {
              displayError = parsed['message'].toString();
            }
          }
        } catch (_) {}
      }

      state.value = state.value.copyWith(
        isLoading: false,
        isSuccess: false,
        errorMessage: displayError,
      );
      return;
    }

    // Direct navigation on success (runs when navigator is mounted)
    if (Get.key.currentState != null) {
      try {
        if (Get.currentRoute != AppRoutes.home) {
          Get.offAllNamed(AppRoutes.home);
        }
      } catch (e) {
        debugPrint('⚠️ [SignUpStore] Direct navigation error: $e');
      }
    }
  }

  Future<void> _onGoogleSubmit() async {
    debugPrint('🔵 [SignUpStore] Initiating Google Sign-Up/In...');
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final googleAuth = googleAuthService ?? GoogleAuthServiceImpl();
      final idToken = await googleAuth.signIn();

      if (idToken == null) {
        debugPrint('⚪ [SignUpStore] Google Sign-Up cancelled by user');
        state.value = state.value.copyWith(isLoading: false);
        return;
      }

      final googleUseCase = loginWithGoogleUseCase ??
          (Get.isRegistered<LoginWithGoogleUseCase>()
              ? Get.find<LoginWithGoogleUseCase>()
              : null);

      if (googleUseCase == null) {
        throw Exception('Google Sign-In service is not configured');
      }

      final user = await googleUseCase.execute(idToken: idToken);

      debugPrint('✅ [SignUpStore] Google registration/login success → user: ${user.username}');
      state.value = state.value.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      debugPrint('❌ [SignUpStore] Google sign-up failed: $e');
      final rawError = e.toString().replaceAll('Exception: ', '');
      String displayError = rawError;

      if (rawError.contains('Connection refused') || rawError.contains('SocketException')) {
        displayError = 'Cannot connect to server. Please check your network or server status.';
      } else if (rawError.contains('ApiException: 10') ||
          rawError.contains('Api10') ||
          rawError.contains(': 10:')) {
        displayError = 'Google Sign-In configuration error (ApiException 10): Android SHA-1 fingerprint or package name is not registered in Google Cloud Console.';
      } else if (rawError.contains('network_error') || rawError.contains('ApiException: 7')) {
        displayError = 'Network error during Google Sign-In. Please check your internet connection.';
      } else {
        try {
          final jsonStart = rawError.indexOf('{');
          if (jsonStart != -1) {
            final jsonStr = rawError.substring(jsonStart);
            final parsed = jsonDecode(jsonStr);
            if (parsed['message'] != null) {
              displayError = parsed['message'].toString();
            }
          }
        } catch (_) {}
      }

      state.value = state.value.copyWith(
        isLoading: false,
        isSuccess: false,
        errorMessage: displayError,
      );
      return;
    }

    if (Get.key.currentState != null) {
      try {
        if (Get.currentRoute != AppRoutes.home) {
          Get.offAllNamed(AppRoutes.home);
        }
      } catch (e) {
        debugPrint('⚠️ [SignUpStore] Direct navigation error: $e');
      }
    }
  }

  Future<void> _onAppleSubmit() async {
    debugPrint('🍏 [SignUpStore] Initiating Apple Sign-Up/In...');
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final appleAuth = appleAuthService ?? AppleAuthServiceImpl();
      final result = await appleAuth.signIn();

      if (result == null) {
        debugPrint('⚪ [SignUpStore] Apple Sign-Up cancelled by user');
        state.value = state.value.copyWith(isLoading: false);
        return;
      }

      final appleUseCase = loginWithAppleUseCase ??
          (Get.isRegistered<LoginWithAppleUseCase>()
              ? Get.find<LoginWithAppleUseCase>()
              : null);

      if (appleUseCase == null) {
        throw Exception('Apple Sign-In service is not configured');
      }

      final user = await appleUseCase.execute(
        identityToken: result.identityToken,
        email: result.email,
        name: result.name,
      );

      debugPrint('✅ [SignUpStore] Apple registration/login success → user: ${user.username}');
      state.value = state.value.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      debugPrint('❌ [SignUpStore] Apple sign-up failed: $e');
      final rawError = e.toString().replaceAll('Exception: ', '');
      String displayError = rawError;

      if (rawError.contains('Connection refused') || rawError.contains('SocketException')) {
        displayError = 'Cannot connect to server. Please check your network or server status.';
      } else {
        try {
          final jsonStart = rawError.indexOf('{');
          if (jsonStart != -1) {
            final jsonStr = rawError.substring(jsonStart);
            final parsed = jsonDecode(jsonStr);
            if (parsed['message'] != null) {
              displayError = parsed['message'].toString();
            }
          }
        } catch (_) {}
      }

      state.value = state.value.copyWith(
        isLoading: false,
        isSuccess: false,
        errorMessage: displayError,
      );
      return;
    }

    if (Get.key.currentState != null) {
      try {
        if (Get.currentRoute != AppRoutes.home) {
          Get.offAllNamed(AppRoutes.home);
        }
      } catch (e) {
        debugPrint('⚠️ [SignUpStore] Direct navigation error: $e');
      }
    }
  }
}

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/db/local_db.dart';
import '../../../core/services/apple_auth_service.dart';
import '../../../core/services/google_auth_service.dart';
import '../../../domain/auth/apple/usecases/login_with_apple_usecase.dart';
import '../../../domain/auth/google/usecases/login_with_google_usecase.dart';
import '../../../domain/auth/login/usecases/login_usecase.dart';
import '../../../routes/app_routes.dart';
import 'login_intent.dart';
import 'login_model.dart';

class LoginStore extends GetxController {
  final LoginUseCase loginUseCase;
  final LoginWithGoogleUseCase? loginWithGoogleUseCase;
  final GoogleAuthService? googleAuthService;
  final LoginWithAppleUseCase? loginWithAppleUseCase;
  final AppleAuthService? appleAuthService;

  late final TextEditingController usernameController;
  late final TextEditingController passwordController;

  LoginStore({
    required this.loginUseCase,
    this.loginWithGoogleUseCase,
    this.googleAuthService,
    this.loginWithAppleUseCase,
    this.appleAuthService,
  }) {
    usernameController = TextEditingController(text: state.value.username);
    passwordController = TextEditingController(text: state.value.password);
  }

  final Rx<LoginModel> state = const LoginModel().obs;

  static const String _rememberedUserKey = 'remembered_username';

  @override
  void onInit() {
    super.onInit();
    
    // Load remembered username if available
    final savedUsername = LocalDB.getString(_rememberedUserKey);
    if (savedUsername != null && savedUsername.isNotEmpty) {
      state.value = state.value.copyWith(
        username: savedUsername,
        rememberMe: true,
      );
      usernameController.text = savedUsername;
    }

    ever(state, (model) {
      if (model.isSuccess && Get.key.currentState != null) {
        try {
          if (Get.currentRoute != AppRoutes.home) {
            Get.offAllNamed(AppRoutes.home);
          }
        } catch (e) {
          debugPrint('⚠️ [LoginStore] Navigation error: $e');
        }
      }
    });
  }

  @override
  void onClose() {
    usernameController.dispose();
    passwordController.dispose();
    super.onClose();
  }

  void onIntent(LoginIntent intent) {
    switch (intent) {
      case LoginUsernameChanged(:final username):
        _onUsernameChanged(username);
      case LoginPasswordChanged(:final password):
        _onPasswordChanged(password);
      case LoginTogglePasswordVisibility():
        _onTogglePasswordVisibility();
      case LoginToggleRememberMe(:final rememberMe):
        _onToggleRememberMe(rememberMe);
      case LoginClearError():
        _onClearError();
      case LoginSubmit():
        _onSubmit();
      case LoginGoogleSubmit():
        _onGoogleSubmit();
      case LoginAppleSubmit():
        _onAppleSubmit();
    }
  }

  void _onUsernameChanged(String username) {
    if (usernameController.text != username) {
      usernameController.text = username;
    }
    state.value = state.value.copyWith(username: username, errorMessage: null);
  }

  void _onPasswordChanged(String password) {
    if (passwordController.text != password) {
      passwordController.text = password;
    }
    state.value = state.value.copyWith(password: password, errorMessage: null);
  }

  void _onTogglePasswordVisibility() {
    state.value = state.value.copyWith(isPasswordVisible: !state.value.isPasswordVisible);
  }

  void _onToggleRememberMe(bool rememberMe) {
    state.value = state.value.copyWith(rememberMe: rememberMe);
  }

  void _onClearError() {
    if (state.value.errorMessage != null) {
      state.value = state.value.copyWith(errorMessage: null);
    }
  }

  Future<void> _onSubmit() async {
    final username = (usernameController.text.isNotEmpty
            ? usernameController.text
            : state.value.username)
        .trim();
    final password = (passwordController.text.isNotEmpty
            ? passwordController.text
            : state.value.password)
        .trim();

    // Client-side validation
    if (username.isEmpty) {
      state.value = state.value.copyWith(
        errorMessage: 'Please enter your username or email',
      );
      return;
    }

    if (password.isEmpty) {
      state.value = state.value.copyWith(
        errorMessage: 'Please enter your password',
      );
      return;
    }

    debugPrint('🔐 [LoginStore] Submitting login for $username...');
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final user = await loginUseCase.execute(
        username: username,
        password: password,
      );

      // Handle remember me
      if (state.value.rememberMe) {
        await LocalDB.setString(_rememberedUserKey, username);
      } else {
        await LocalDB.remove(_rememberedUserKey);
      }

      debugPrint('✅ [LoginStore] Login success → user: ${user.username}');
      state.value = state.value.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      debugPrint('❌ [LoginStore] Login failed: $e');
      final rawError = e.toString().replaceAll('Exception: ', '');
      String displayError = rawError;

      if (rawError.contains('Connection refused') || rawError.contains('SocketException')) {
        displayError = 'Cannot connect to server. Please check your network or server status.';
      } else if (rawError.contains('Invalid credentials')) {
        displayError = 'Invalid username or password. Please try again.';
      } else {
        // Try parsing JSON message from backend
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
        debugPrint('⚠️ [LoginStore] Direct navigation error: $e');
      }
    }
  }

  Future<void> _onGoogleSubmit() async {
    debugPrint('🔵 [LoginStore] Initiating Google Sign-In...');
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final googleAuth = googleAuthService ?? GoogleAuthServiceImpl();
      final idToken = await googleAuth.signIn();

      if (idToken == null) {
        debugPrint('⚪ [LoginStore] Google Sign-In cancelled by user');
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

      debugPrint('✅ [LoginStore] Google login success → user: ${user.username}');
      state.value = state.value.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      debugPrint('❌ [LoginStore] Google login failed: $e');
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
        debugPrint('⚠️ [LoginStore] Direct navigation error: $e');
      }
    }
  }

  Future<void> _onAppleSubmit() async {
    debugPrint('🍏 [LoginStore] Initiating Apple Sign-In...');
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final appleAuth = appleAuthService ?? AppleAuthServiceImpl();
      final result = await appleAuth.signIn();

      if (result == null) {
        debugPrint('⚪ [LoginStore] Apple Sign-In cancelled by user');
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

      debugPrint('✅ [LoginStore] Apple login success → user: ${user.username}');
      state.value = state.value.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      debugPrint('❌ [LoginStore] Apple login failed: $e');
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
        debugPrint('⚠️ [LoginStore] Direct navigation error: $e');
      }
    }
  }
}

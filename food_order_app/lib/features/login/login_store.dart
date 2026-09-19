import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../../core/db/local_db.dart';
import '../../domain/auth/login/usecases/login_usecase.dart';
import '../../routes/app_routes.dart';
import 'login_intent.dart';
import 'login_model.dart';

class LoginStore extends GetxController {
  final LoginUseCase _loginUseCase;

  // ignore: prefer_initializing_formals
  LoginStore({required LoginUseCase loginUseCase}) : _loginUseCase = loginUseCase;

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
    }

    ever(state, (model) {
      if (model.isSuccess) {
        Get.offAllNamed(AppRoutes.home);
      }
    });
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
    }
  }

  void _onUsernameChanged(String username) {
    state.value = state.value.copyWith(username: username, errorMessage: null);
  }

  void _onPasswordChanged(String password) {
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
    final username = state.value.username.trim();
    final password = state.value.password.trim();

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
      final user = await _loginUseCase.execute(
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
    }
  }
}

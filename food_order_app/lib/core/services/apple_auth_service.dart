import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

class AppleAuthResult {
  final String identityToken;
  final String? email;
  final String? name;

  const AppleAuthResult({
    required this.identityToken,
    this.email,
    this.name,
  });
}

abstract class AppleAuthService {
  /// Prompts Sign in with Apple and returns the identityToken, email, and name.
  /// Returns null if the user cancelled the dialog.
  Future<AppleAuthResult?> signIn();

  /// Checks if Sign in with Apple is supported on this platform/device.
  Future<bool> isAvailable();
}

class AppleAuthServiceImpl implements AppleAuthService {
  @override
  Future<bool> isAvailable() async {
    try {
      if (kIsWeb) return false;
      return await SignInWithApple.isAvailable();
    } catch (_) {
      return false;
    }
  }

  @override
  Future<AppleAuthResult?> signIn() async {
    try {
      debugPrint('🍏 [AppleAuthService] Requesting Apple credentials...');

      final available = await isAvailable();
      if (!available && !Platform.isIOS && !Platform.isMacOS) {
        throw Exception(
          'Sign in with Apple is supported on Apple devices (iOS / macOS).',
        );
      }

      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      final identityToken = credential.identityToken;
      if (identityToken == null || identityToken.isEmpty) {
        throw Exception('Failed to retrieve Apple identity token');
      }

      String? fullName;
      if (credential.givenName != null || credential.familyName != null) {
        final parts = [credential.givenName, credential.familyName]
            .where((p) => p != null && p.isNotEmpty)
            .join(' ');
        if (parts.isNotEmpty) {
          fullName = parts;
        }
      }

      debugPrint('🍏 [AppleAuthService] Retrieved Apple credentials successfully');
      return AppleAuthResult(
        identityToken: identityToken,
        email: credential.email,
        name: fullName,
      );
    } on SignInWithAppleAuthorizationException catch (e) {
      if (e.code == AuthorizationErrorCode.canceled) {
        debugPrint('⚪ [AppleAuthService] User cancelled Apple Sign-In');
        return null;
      }
      debugPrint('❌ [AppleAuthService] Apple auth error: ${e.message}');
      rethrow;
    } catch (e) {
      debugPrint('❌ [AppleAuthService] Apple Sign-In error: $e');
      rethrow;
    }
  }
}

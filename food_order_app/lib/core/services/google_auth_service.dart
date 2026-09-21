import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../config/app_environment.dart';

abstract class GoogleAuthService {
  /// Prompts Google Sign-In and returns the idToken for backend verification.
  /// Returns null if the user cancelled the dialog.
  Future<String?> signIn();

  /// Signs out from the Google session.
  Future<void> signOut();

  /// Checks if a user is currently signed in to Google.
  Future<bool> isSignedIn();
}

class GoogleAuthServiceImpl implements GoogleAuthService {
  final GoogleSignIn _googleSignIn;

  GoogleAuthServiceImpl({GoogleSignIn? googleSignIn})
      : _googleSignIn = googleSignIn ??
            GoogleSignIn(
              serverClientId: AppConfig.googleServerClientId,
              scopes: const ['email', 'profile'],
            );

  @override
  Future<String?> signIn() async {
    try {
      debugPrint('🔵 [GoogleAuthService] Initiating Google Sign-In...');
      // Ensure clean state before prompting
      await _googleSignIn.signOut().catchError((_) => null);

      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account == null) {
        debugPrint('⚪ [GoogleAuthService] User cancelled Google Sign-In');
        return null;
      }

      debugPrint('🔵 [GoogleAuthService] Signed in as: ${account.email}');
      final GoogleSignInAuthentication auth = await account.authentication;
      final idToken = auth.idToken;

      if (idToken == null || idToken.isEmpty) {
        debugPrint('⚠️ [GoogleAuthService] Missing idToken, falling back to accessToken');
        return auth.accessToken;
      }

      debugPrint('🔑 [GoogleAuthService] Retrieved Google idToken successfully');
      return idToken;
    } catch (e) {
      debugPrint('❌ [GoogleAuthService] Google Sign-In error: $e');
      rethrow;
    }
  }

  @override
  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (e) {
      debugPrint('⚠️ [GoogleAuthService] Error during Google signOut: $e');
    }
  }

  @override
  Future<bool> isSignedIn() async {
    return _googleSignIn.isSignedIn();
  }
}

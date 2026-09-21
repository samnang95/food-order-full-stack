import '../entities/google_user_entity.dart';

abstract class GoogleAuthRepository {
  Future<GoogleUserEntity> loginWithGoogle(String idToken);
}

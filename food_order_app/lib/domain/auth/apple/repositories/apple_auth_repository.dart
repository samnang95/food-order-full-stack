import '../entities/apple_user_entity.dart';

abstract class AppleAuthRepository {
  Future<AppleUserEntity> loginWithApple({
    required String identityToken,
    String? email,
    String? name,
  });
}

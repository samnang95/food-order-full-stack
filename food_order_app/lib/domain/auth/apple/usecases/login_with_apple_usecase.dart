import '../entities/apple_user_entity.dart';
import '../repositories/apple_auth_repository.dart';

class LoginWithAppleUseCase {
  final AppleAuthRepository repository;

  LoginWithAppleUseCase({required this.repository});

  Future<AppleUserEntity> execute({
    required String identityToken,
    String? email,
    String? name,
  }) async {
    return await repository.loginWithApple(
      identityToken: identityToken,
      email: email,
      name: name,
    );
  }
}

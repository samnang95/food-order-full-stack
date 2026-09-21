import '../entities/google_user_entity.dart';
import '../repositories/google_auth_repository.dart';

class LoginWithGoogleUseCase {
  final GoogleAuthRepository repository;

  LoginWithGoogleUseCase({required this.repository});

  Future<GoogleUserEntity> execute({required String idToken}) async {
    return await repository.loginWithGoogle(idToken);
  }
}

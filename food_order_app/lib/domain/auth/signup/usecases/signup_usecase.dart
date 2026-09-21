import '../entities/signup_user_entity.dart';
import '../repositories/signup_repository.dart';

class SignUpUseCase {
  final SignUpRepository repository;

  SignUpUseCase({required this.repository});

  Future<SignUpUserEntity> execute({
    required String username,
    required String email,
    required String password,
  }) {
    return repository.signUp(
      username: username,
      email: email,
      password: password,
    );
  }
}

import '../entities/signup_user_entity.dart';

abstract class SignUpRepository {
  Future<SignUpUserEntity> signUp({
    required String username,
    required String email,
    required String password,
  });
}

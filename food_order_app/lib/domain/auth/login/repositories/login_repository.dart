import '../entities/login_user_entity.dart';

abstract class LoginRepository {
  Future<LoginUserEntity> login({
    required String username,
    required String password,
  });
}

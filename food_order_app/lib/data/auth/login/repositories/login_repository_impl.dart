import '../../../../domain/auth/login/entities/login_user_entity.dart';
import '../../../../domain/auth/login/repositories/login_repository.dart';
import '../datasources/login_remote_datasource.dart';
import '../models/login_request_model.dart';

class LoginRepositoryImpl implements LoginRepository {
  final LoginRemoteDataSource remoteDataSource;

  LoginRepositoryImpl({required this.remoteDataSource});

  @override
  Future<LoginUserEntity> login({
    required String username,
    required String password,
  }) async {
    final request = LoginRequestModel(username: username, password: password);
    final responseModel = await remoteDataSource.login(request);
    return responseModel.toEntity();
  }
}

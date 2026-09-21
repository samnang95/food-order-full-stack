import '../../../../domain/auth/signup/entities/signup_user_entity.dart';
import '../../../../domain/auth/signup/repositories/signup_repository.dart';
import '../datasources/signup_remote_datasource.dart';
import '../models/signup_request_model.dart';

class SignUpRepositoryImpl implements SignUpRepository {
  final SignUpRemoteDataSource remoteDataSource;

  SignUpRepositoryImpl({required this.remoteDataSource});

  @override
  Future<SignUpUserEntity> signUp({
    required String username,
    required String email,
    required String password,
  }) async {
    final request = SignUpRequestModel(
      username: username,
      email: email,
      password: password,
    );
    final response = await remoteDataSource.signUp(request);
    return response.toEntity();
  }
}

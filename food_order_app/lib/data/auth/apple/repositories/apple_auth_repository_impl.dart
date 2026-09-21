import '../../../../domain/auth/apple/entities/apple_user_entity.dart';
import '../../../../domain/auth/apple/repositories/apple_auth_repository.dart';
import '../datasources/apple_auth_remote_datasource.dart';

class AppleAuthRepositoryImpl implements AppleAuthRepository {
  final AppleAuthRemoteDataSource remoteDataSource;

  AppleAuthRepositoryImpl({required this.remoteDataSource});

  @override
  Future<AppleUserEntity> loginWithApple({
    required String identityToken,
    String? email,
    String? name,
  }) async {
    final responseModel = await remoteDataSource.loginWithApple(
      identityToken: identityToken,
      email: email,
      name: name,
    );
    return responseModel.toEntity();
  }
}

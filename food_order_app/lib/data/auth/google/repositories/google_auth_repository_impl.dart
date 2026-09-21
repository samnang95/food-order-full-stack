import '../../../../domain/auth/google/entities/google_user_entity.dart';
import '../../../../domain/auth/google/repositories/google_auth_repository.dart';
import '../datasources/google_auth_remote_datasource.dart';

class GoogleAuthRepositoryImpl implements GoogleAuthRepository {
  final GoogleAuthRemoteDataSource remoteDataSource;

  GoogleAuthRepositoryImpl({required this.remoteDataSource});

  @override
  Future<GoogleUserEntity> loginWithGoogle(String idToken) async {
    final responseModel = await remoteDataSource.loginWithGoogle(idToken);
    return responseModel.toEntity();
  }
}

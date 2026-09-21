import 'package:get/get.dart';
import '../../../core/services/apple_auth_service.dart';
import '../../../core/services/google_auth_service.dart';
import '../../../data/auth/apple/datasources/apple_auth_remote_datasource.dart';
import '../../../data/auth/apple/repositories/apple_auth_repository_impl.dart';
import '../../../data/auth/google/datasources/google_auth_remote_datasource.dart';
import '../../../data/auth/google/repositories/google_auth_repository_impl.dart';
import '../../../data/auth/login/datasources/login_remote_datasource.dart';
import '../../../data/auth/login/repositories/login_repository_impl.dart';
import '../../../domain/auth/apple/usecases/login_with_apple_usecase.dart';
import '../../../domain/auth/google/usecases/login_with_google_usecase.dart';
import '../../../domain/auth/login/usecases/login_usecase.dart';
import 'login_store.dart';

class LoginBinding extends Bindings {
  @override
  void dependencies() {
    // Services
    if (!Get.isRegistered<GoogleAuthService>()) {
      Get.lazyPut<GoogleAuthService>(() => GoogleAuthServiceImpl());
    }
    if (!Get.isRegistered<AppleAuthService>()) {
      Get.lazyPut<AppleAuthService>(() => AppleAuthServiceImpl());
    }

    // Login Feature
    Get.lazyPut<LoginRemoteDataSource>(() => LoginRemoteDataSourceImpl());
    Get.lazyPut<LoginRepositoryImpl>(() => LoginRepositoryImpl(
      remoteDataSource: Get.find<LoginRemoteDataSource>(),
    ));
    Get.lazyPut(() => LoginUseCase(
      repository: Get.find<LoginRepositoryImpl>(),
    ));

    // Google Feature
    if (!Get.isRegistered<GoogleAuthRemoteDataSource>()) {
      Get.lazyPut<GoogleAuthRemoteDataSource>(() => GoogleAuthRemoteDataSourceImpl());
    }
    if (!Get.isRegistered<GoogleAuthRepositoryImpl>()) {
      Get.lazyPut(() => GoogleAuthRepositoryImpl(
        remoteDataSource: Get.find<GoogleAuthRemoteDataSource>(),
      ));
    }
    if (!Get.isRegistered<LoginWithGoogleUseCase>()) {
      Get.lazyPut(() => LoginWithGoogleUseCase(
        repository: Get.find<GoogleAuthRepositoryImpl>(),
      ));
    }

    // Apple Feature
    if (!Get.isRegistered<AppleAuthRemoteDataSource>()) {
      Get.lazyPut<AppleAuthRemoteDataSource>(() => AppleAuthRemoteDataSourceImpl());
    }
    if (!Get.isRegistered<AppleAuthRepositoryImpl>()) {
      Get.lazyPut(() => AppleAuthRepositoryImpl(
        remoteDataSource: Get.find<AppleAuthRemoteDataSource>(),
      ));
    }
    if (!Get.isRegistered<LoginWithAppleUseCase>()) {
      Get.lazyPut(() => LoginWithAppleUseCase(
        repository: Get.find<AppleAuthRepositoryImpl>(),
      ));
    }

    // Store
    Get.lazyPut(() => LoginStore(
      loginUseCase: Get.find<LoginUseCase>(),
      loginWithGoogleUseCase: Get.find<LoginWithGoogleUseCase>(),
      googleAuthService: Get.find<GoogleAuthService>(),
      loginWithAppleUseCase: Get.find<LoginWithAppleUseCase>(),
      appleAuthService: Get.find<AppleAuthService>(),
    ));
  }
}

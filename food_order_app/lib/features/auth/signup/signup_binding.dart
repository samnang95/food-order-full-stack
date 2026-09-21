import 'package:get/get.dart';
import '../../../core/services/apple_auth_service.dart';
import '../../../core/services/google_auth_service.dart';
import '../../../data/auth/apple/datasources/apple_auth_remote_datasource.dart';
import '../../../data/auth/apple/repositories/apple_auth_repository_impl.dart';
import '../../../data/auth/google/datasources/google_auth_remote_datasource.dart';
import '../../../data/auth/google/repositories/google_auth_repository_impl.dart';
import '../../../data/auth/signup/datasources/signup_remote_datasource.dart';
import '../../../data/auth/signup/repositories/signup_repository_impl.dart';
import '../../../domain/auth/apple/usecases/login_with_apple_usecase.dart';
import '../../../domain/auth/google/usecases/login_with_google_usecase.dart';
import '../../../domain/auth/signup/usecases/signup_usecase.dart';
import 'signup_store.dart';

class SignUpBinding extends Bindings {
  @override
  void dependencies() {
    // SignUp Feature
    Get.lazyPut<SignUpRemoteDataSource>(() => SignUpRemoteDataSourceImpl());
    Get.lazyPut<SignUpRepositoryImpl>(() => SignUpRepositoryImpl(
      remoteDataSource: Get.find<SignUpRemoteDataSource>(),
    ));
    Get.lazyPut(() => SignUpUseCase(
      repository: Get.find<SignUpRepositoryImpl>(),
    ));

    // Services
    if (!Get.isRegistered<GoogleAuthService>()) {
      Get.lazyPut<GoogleAuthService>(() => GoogleAuthServiceImpl());
    }
    if (!Get.isRegistered<AppleAuthService>()) {
      Get.lazyPut<AppleAuthService>(() => AppleAuthServiceImpl());
    }

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
    Get.lazyPut(() => SignUpStore(
      signUpUseCase: Get.find<SignUpUseCase>(),
      loginWithGoogleUseCase: Get.find<LoginWithGoogleUseCase>(),
      googleAuthService: Get.find<GoogleAuthService>(),
      loginWithAppleUseCase: Get.find<LoginWithAppleUseCase>(),
      appleAuthService: Get.find<AppleAuthService>(),
    ));
  }
}

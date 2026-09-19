import 'package:get/get.dart';
import '../../data/auth/login/datasources/login_remote_datasource.dart';
import '../../data/auth/login/repositories/login_repository_impl.dart';
import '../../domain/auth/login/usecases/login_usecase.dart';
import 'login_store.dart';

class LoginBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => LoginRemoteDataSourceImpl());
    Get.lazyPut(() => LoginRepositoryImpl(
      remoteDataSource: Get.find<LoginRemoteDataSourceImpl>(),
    ));
    Get.lazyPut(() => LoginUseCase(
      repository: Get.find<LoginRepositoryImpl>(),
    ));
    Get.lazyPut(() => LoginStore(
      loginUseCase: Get.find<LoginUseCase>(),
    ));
  }
}

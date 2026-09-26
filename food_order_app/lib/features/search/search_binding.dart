import 'package:get/get.dart';
import '../../data/category/datasources/category_remote_datasource.dart';
import '../../data/category/repositories/category_repository_impl.dart';
import '../../data/food/datasources/food_remote_datasource.dart';
import '../../data/food/repositories/food_repository_impl.dart';
import '../../domain/category/usecases/get_categories_usecase.dart';
import '../../domain/food/usecases/get_foods_usecase.dart';
import 'search_store.dart';

class SearchBinding extends Bindings {
  @override
  void dependencies() {
    // Category UseCase
    if (!Get.isRegistered<CategoryRemoteDataSource>()) {
      Get.lazyPut<CategoryRemoteDataSource>(() => CategoryRemoteDataSourceImpl());
    }
    if (!Get.isRegistered<CategoryRepositoryImpl>()) {
      Get.lazyPut(() => CategoryRepositoryImpl(
            remoteDataSource: Get.find<CategoryRemoteDataSource>(),
          ));
    }
    if (!Get.isRegistered<GetCategoriesUseCase>()) {
      Get.lazyPut(() => GetCategoriesUseCase(
            repository: Get.find<CategoryRepositoryImpl>(),
          ));
    }

    // Food UseCase
    if (!Get.isRegistered<FoodRemoteDataSource>()) {
      Get.lazyPut<FoodRemoteDataSource>(() => FoodRemoteDataSourceImpl());
    }
    if (!Get.isRegistered<FoodRepositoryImpl>()) {
      Get.lazyPut(() => FoodRepositoryImpl(
            remoteDataSource: Get.find<FoodRemoteDataSource>(),
          ));
    }
    if (!Get.isRegistered<GetFoodsUseCase>()) {
      Get.lazyPut(() => GetFoodsUseCase(
            repository: Get.find<FoodRepositoryImpl>(),
          ));
    }

    // Search Store
    Get.lazyPut<SearchStore>(
      () => SearchStore(
        getFoodsUseCase: Get.find<GetFoodsUseCase>(),
        getCategoriesUseCase: Get.find<GetCategoriesUseCase>(),
      ),
    );
  }
}

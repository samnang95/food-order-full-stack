import 'package:get/get.dart';
import '../../data/category/datasources/category_remote_datasource.dart';
import '../../data/category/repositories/category_repository_impl.dart';
import '../../data/food/datasources/food_remote_datasource.dart';
import '../../data/food/repositories/food_repository_impl.dart';
import '../../domain/category/usecases/get_categories_usecase.dart';
import '../../domain/food/usecases/get_foods_usecase.dart';
import 'home_store.dart';

class HomeBinding extends Bindings {
  @override
  void dependencies() {
    // Category
    Get.lazyPut<CategoryRemoteDataSource>(() => CategoryRemoteDataSourceImpl());
    Get.lazyPut(() => CategoryRepositoryImpl(
      remoteDataSource: Get.find<CategoryRemoteDataSource>(),
    ));
    Get.lazyPut(() => GetCategoriesUseCase(
      repository: Get.find<CategoryRepositoryImpl>(),
    ));

    // Food
    Get.lazyPut<FoodRemoteDataSource>(() => FoodRemoteDataSourceImpl());
    Get.lazyPut(() => FoodRepositoryImpl(
      remoteDataSource: Get.find<FoodRemoteDataSource>(),
    ));
    Get.lazyPut(() => GetFoodsUseCase(
      repository: Get.find<FoodRepositoryImpl>(),
    ));

    // Store
    Get.lazyPut(() => HomeStore(
      getCategoriesUseCase: Get.find<GetCategoriesUseCase>(),
      getFoodsUseCase: Get.find<GetFoodsUseCase>(),
    ));
  }
}

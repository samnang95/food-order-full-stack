import 'package:get/get.dart';
import '../../data/category/datasources/category_remote_datasource.dart';
import '../../data/category/repositories/category_repository_impl.dart';
import '../../data/food/datasources/food_remote_datasource.dart';
import '../../data/food/repositories/food_repository_impl.dart';
import '../../data/order/datasources/order_remote_datasource.dart';
import '../../data/order/repositories/order_repository_impl.dart';
import '../../domain/category/usecases/get_categories_usecase.dart';
import '../../domain/food/usecases/get_foods_usecase.dart';
import '../../domain/order/repositories/order_repository.dart';
import '../home/home_store.dart';
import '../orders/orders_store.dart';
import 'main_nav_store.dart';

class MainNavBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => MainNavStore());

    // Category
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

    // Food
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

    // Order
    if (!Get.isRegistered<OrderRemoteDataSource>()) {
      Get.lazyPut<OrderRemoteDataSource>(() => OrderRemoteDataSourceImpl());
    }
    if (!Get.isRegistered<OrderRepository>()) {
      Get.lazyPut<OrderRepository>(() => OrderRepositoryImpl(
        remoteDataSource: Get.find<OrderRemoteDataSource>(),
      ));
    }
    if (!Get.isRegistered<OrdersStore>()) {
      Get.lazyPut(() => OrdersStore(
        orderRepository: Get.find<OrderRepository>(),
      ));
    }

    // Home Store
    Get.lazyPut(() => HomeStore(
      getCategoriesUseCase: Get.find<GetCategoriesUseCase>(),
      getFoodsUseCase: Get.find<GetFoodsUseCase>(),
    ));
  }
}

import 'package:get/get.dart';
import '../../domain/food/usecases/get_foods_usecase.dart';
import 'category_detail_store.dart';

class CategoryDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CategoryDetailStore>(
      () => CategoryDetailStore(
        getFoodsUseCase: Get.isRegistered<GetFoodsUseCase>()
            ? Get.find<GetFoodsUseCase>()
            : null,
      ),
    );
  }
}

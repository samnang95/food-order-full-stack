import 'package:get/get.dart';
import 'food_detail_store.dart';

class FoodDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FoodDetailStore>(() => FoodDetailStore());
  }
}

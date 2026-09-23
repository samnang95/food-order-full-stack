import 'package:get/get.dart';
import 'cart_store.dart';

class CartBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CartStore>(() => CartStore());
  }
}

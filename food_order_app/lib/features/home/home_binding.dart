import 'package:get/get.dart';
import 'home_store.dart';

class HomeBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => HomeStore());
  }
}

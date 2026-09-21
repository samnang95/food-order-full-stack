import 'package:get/get.dart';
import '../home/home_store.dart';
import 'main_nav_store.dart';

class MainNavBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => MainNavStore());
    Get.lazyPut(() => HomeStore());
  }
}

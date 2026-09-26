import 'package:get/get.dart';
import 'favorites_store.dart';

class FavoritesBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<FavoritesStore>(() => FavoritesStore());
  }
}

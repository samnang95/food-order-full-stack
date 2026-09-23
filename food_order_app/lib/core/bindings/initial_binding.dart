import 'package:get/get.dart';
import '../services/favorites_service.dart';

class InitialBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<FavoritesService>()) {
      Get.put(FavoritesService(), permanent: true);
    }
  }
}

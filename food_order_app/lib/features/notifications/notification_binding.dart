import 'package:get/get.dart';
import 'notification_store.dart';

class NotificationBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<NotificationStore>()) {
      Get.lazyPut(() => NotificationStore());
    }
  }
}

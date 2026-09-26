import 'package:get/get.dart';
import '../controllers/voucher_bottom_sheet_controller.dart';
import '../services/address_service.dart';
import '../services/cart_service.dart';
import '../services/favorites_service.dart';
import '../services/voucher_service.dart';

class InitialBinding extends Bindings {
  @override
  void dependencies() {
    if (!Get.isRegistered<AddressService>()) {
      Get.put(AddressService(), permanent: true);
    }
    if (!Get.isRegistered<FavoritesService>()) {
      Get.put(FavoritesService(), permanent: true);
    }
    if (!Get.isRegistered<VoucherService>()) {
      Get.put(VoucherService(), permanent: true);
    }
    if (!Get.isRegistered<CartService>()) {
      Get.put(CartService(), permanent: true);
    }
    if (!Get.isRegistered<VoucherBottomSheetController>()) {
      Get.put(VoucherBottomSheetController(), permanent: true);
    }
  }
}

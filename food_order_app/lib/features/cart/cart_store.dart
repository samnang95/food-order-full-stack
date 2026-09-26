import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/cart_service.dart';
import '../../routes/app_routes.dart';
import 'cart_intent.dart';

class CartStore extends GetxController {
  CartService get cartService {
    if (Get.isRegistered<CartService>()) {
      return Get.find<CartService>();
    }
    return Get.put(CartService(), permanent: true);
  }

  void onIntent(CartIntent intent) {
    switch (intent) {
      case CartIncrementQty(:final foodId):
        cartService.incrementQuantity(foodId);
      case CartDecrementQty(:final foodId):
        cartService.decrementQuantity(foodId);
      case CartRemoveItem(:final foodId):
        cartService.removeItem(foodId);
      case CartClear():
        _onClearCart();
      case CartCheckout():
        _onCheckout();
      case CartApplyVoucher(:final code):
        cartService.voucherService.applyVoucher(code, cartService.subtotal);
      case CartRemoveVoucher():
        cartService.voucherService.removeVoucher();
    }
  }

  void _onClearCart() {
    Get.dialog(
      AlertDialog(
        title: const Text('Clear Cart?'),
        content: const Text('Are you sure you want to remove all items from your cart?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              cartService.clearCart();
              Get.back();
            },
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  void _onCheckout() {
    if (cartService.isEmpty) return;
    Get.toNamed(AppRoutes.checkout);
  }
}


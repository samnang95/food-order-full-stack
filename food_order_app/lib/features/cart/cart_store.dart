import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/cart_service.dart';
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

    if (Get.context != null) {
      Get.snackbar(
        'Checkout Ready! 🎉',
        'Total: \$${cartService.totalAmount.toStringAsFixed(2)} with ${cartService.totalQuantity} items. Checkout flow coming up next!',
        snackPosition: SnackPosition.TOP,
        backgroundColor: AppColors.primary,
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
        icon: const Icon(
          Icons.payment_rounded,
          color: Colors.white,
          size: 28,
        ),
      );
    }
  }
}

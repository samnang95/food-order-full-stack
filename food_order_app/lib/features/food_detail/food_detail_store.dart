import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/cart_service.dart';
import '../../core/services/favorites_service.dart';
import '../../domain/food/entities/food_entity.dart';
import '../../routes/app_routes.dart';
import 'food_detail_intent.dart';
import 'food_detail_model.dart';

class FoodDetailStore extends GetxController {
  late final Rx<FoodDetailModel> state;

  FavoritesService get _favoritesService {
    if (Get.isRegistered<FavoritesService>()) {
      return Get.find<FavoritesService>();
    }
    return Get.put(FavoritesService(), permanent: true);
  }

  CartService get _cartService {
    if (Get.isRegistered<CartService>()) {
      return Get.find<CartService>();
    }
    return Get.put(CartService(), permanent: true);
  }

  @override
  void onInit() {
    super.onInit();
    final FoodEntity food = Get.arguments is FoodEntity
        ? Get.arguments as FoodEntity
        : const FoodEntity(
            id: '',
            name: 'Food Item',
            price: 0.0,
          );

    final isFav = _favoritesService.isFavorite(food.id);
    state = FoodDetailModel(food: food, isFavorite: isFav).obs;

    // Listen to favorites service changes if toggled from elsewhere
    ever(_favoritesService.favoriteIds, (_) {
      final currentFav = _favoritesService.isFavorite(state.value.food.id);
      if (state.value.isFavorite != currentFav) {
        state.value = state.value.copyWith(isFavorite: currentFav);
      }
    });
  }

  void onIntent(FoodDetailIntent intent) {
    switch (intent) {
      case FoodDetailIncrementQty():
        _onIncrementQty();
      case FoodDetailDecrementQty():
        _onDecrementQty();
      case FoodDetailToggleFavorite():
        _onToggleFavorite();
      case FoodDetailSpecialInstructionsChanged(:final instructions):
        _onSpecialInstructionsChanged(instructions);
      case FoodDetailAddToCart():
        _onAddToCart();
    }
  }

  void _onIncrementQty() {
    final currentQty = state.value.quantity;
    if (currentQty < 99) {
      state.value = state.value.copyWith(quantity: currentQty + 1);
    }
  }

  void _onDecrementQty() {
    final currentQty = state.value.quantity;
    if (currentQty > 1) {
      state.value = state.value.copyWith(quantity: currentQty - 1);
    }
  }

  Future<void> _onToggleFavorite() async {
    final food = state.value.food;
    final isFav = await _favoritesService.toggleFavorite(food);
    state.value = state.value.copyWith(isFavorite: isFav);

    if (Get.context != null) {
      Get.snackbar(
        isFav ? 'Added to Favorites ❤️' : 'Removed from Favorites',
        isFav
            ? '${food.name} saved to your favorites'
            : '${food.name} removed from favorites',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: isFav ? AppColors.primary : Colors.grey[800],
        colorText: Colors.white,
        duration: const Duration(seconds: 2),
        margin: const EdgeInsets.all(16),
        borderRadius: 12,
        icon: Icon(
          isFav ? Icons.favorite_rounded : Icons.favorite_border_rounded,
          color: Colors.white,
        ),
      );
    }
  }

  void _onSpecialInstructionsChanged(String instructions) {
    state.value = state.value.copyWith(specialInstructions: instructions);
  }

  void _onAddToCart() {
    final current = state.value;
    _cartService.addItem(
      current.food,
      quantity: current.quantity,
      specialInstructions: current.specialInstructions,
    );

    if (Get.context != null) {
      Get.snackbar(
        'Added to Cart! 🛒',
        '${current.quantity}x ${current.food.name} (\$${current.totalPrice.toStringAsFixed(2)})',
        snackPosition: SnackPosition.TOP,
        backgroundColor: AppColors.primary,
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
        icon: const Icon(
          Icons.check_circle_rounded,
          color: Colors.white,
          size: 28,
        ),
        mainButton: TextButton(
          onPressed: () => Get.toNamed(AppRoutes.cart),
          child: const Text(
            'VIEW CART',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      );
    }
  }
}

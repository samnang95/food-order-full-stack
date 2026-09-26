import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/cart_service.dart';
import '../../core/services/favorites_service.dart';
import '../../domain/food/entities/food_entity.dart';
import 'favorites_intent.dart';
import 'favorites_state.dart';

class FavoritesStore extends GetxController {
  FavoritesService get favoritesService {
    if (Get.isRegistered<FavoritesService>()) {
      return Get.find<FavoritesService>();
    }
    return Get.put(FavoritesService(), permanent: true);
  }

  CartService get cartService {
    if (Get.isRegistered<CartService>()) {
      return Get.find<CartService>();
    }
    return Get.put(CartService(), permanent: true);
  }

  final Rx<FavoritesState> state = const FavoritesState().obs;
  final TextEditingController searchController = TextEditingController();

  @override
  void onInit() {
    super.onInit();
    _syncFavorites();
    ever(favoritesService.favoriteIds, (_) {
      _syncFavorites();
    });
  }

  @override
  void onClose() {
    searchController.dispose();
    super.onClose();
  }

  void _syncFavorites() {
    state.value = state.value.copyWith(
      favoriteFoods: favoritesService.favoriteFoods,
    );
  }

  void onIntent(FavoritesIntent intent) {
    switch (intent) {
      case FavoritesSearchChanged(:final query):
        setSearchQuery(query);
      case FavoritesClearSearch():
        clearSearch();
      case FavoritesCategorySelected(:final category):
        setSelectedCategory(category);
      case FavoritesSortChanged(:final sort):
        setSelectedSort(sort);
      case FavoritesAddAllToCart():
        addAllToCart();
      case FavoritesRemoveItem(:final foodId):
        removeFavorite(foodId);
      case FavoritesClearAll():
        clearAll();
    }
  }

  void setSearchQuery(String query) {
    state.value = state.value.copyWith(searchQuery: query);
    if (searchController.text != query) {
      searchController.text = query;
    }
  }

  void clearSearch() {
    state.value = state.value.copyWith(searchQuery: '');
    searchController.clear();
  }

  void setSelectedCategory(String category) {
    state.value = state.value.copyWith(selectedCategory: category);
  }

  void setSelectedSort(String sort) {
    state.value = state.value.copyWith(selectedSort: sort);
  }

  List<FoodEntity> get filteredFoods => state.value.filteredFoods;
  List<String> get availableCategories => state.value.availableCategories;
  String get searchQuery => state.value.searchQuery;
  String get selectedCategory => state.value.selectedCategory;
  String get selectedSort => state.value.selectedSort;

  void addAllToCart() {
    final list = filteredFoods;
    if (list.isEmpty) return;

    for (final food in list) {
      cartService.addItem(food);
    }

    if (Get.context != null && Get.overlayContext != null) {
      Get.snackbar(
        'Added to Cart',
        'Added ${list.length} favorite ${list.length == 1 ? "dish" : "dishes"} to your cart',
        snackPosition: SnackPosition.TOP,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 2),
        icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
      );
    }
  }

  Future<void> removeFavorite(String foodId) async {
    await favoritesService.removeFavorite(foodId);
  }

  Future<void> clearAll() async {
    await favoritesService.clearFavorites();
  }
}

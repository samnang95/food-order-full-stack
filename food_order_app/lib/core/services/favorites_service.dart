import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../../domain/food/entities/food_entity.dart';
import '../db/local_db.dart';

class FavoritesService extends GetxService {
  static const String _keyIds = 'favorite_food_ids';
  static const String _keyFoods = 'favorite_foods_data';

  final RxSet<String> favoriteIds = <String>{}.obs;
  final RxList<FoodEntity> favoriteFoods = <FoodEntity>[].obs;

  @override
  void onInit() {
    super.onInit();
    _loadFavorites();
  }

  void _loadFavorites() {
    try {
      final savedIds = LocalDB.getStringList(_keyIds) ?? [];
      favoriteIds.assignAll(savedIds);

      final savedFoodsJson = LocalDB.getString(_keyFoods);
      if (savedFoodsJson != null && savedFoodsJson.isNotEmpty) {
        final List<dynamic> decoded = jsonDecode(savedFoodsJson);
        final list = decoded
            .map((item) => FoodEntity.fromJson(item as Map<String, dynamic>))
            .toList();
        favoriteFoods.assignAll(list);
      }
      debugPrint('❤️ [FavoritesService] Loaded ${favoriteIds.length} favorites');
    } catch (e) {
      debugPrint('⚠️ [FavoritesService] Failed to load favorites: $e');
    }
  }

  bool isFavorite(String foodId) {
    return favoriteIds.contains(foodId);
  }

  Future<bool> toggleFavorite(FoodEntity food) async {
    if (food.id.isEmpty) return false;

    final currentlyFav = isFavorite(food.id);

    if (currentlyFav) {
      favoriteIds.remove(food.id);
      favoriteFoods.removeWhere((f) => f.id == food.id);
      await _persist();
      return false;
    } else {
      favoriteIds.add(food.id);
      favoriteFoods.removeWhere((f) => f.id == food.id); // avoid duplicates
      favoriteFoods.insert(0, food);
      await _persist();
      return true;
    }
  }

  Future<void> removeFavorite(String foodId) async {
    if (favoriteIds.remove(foodId)) {
      favoriteFoods.removeWhere((f) => f.id == foodId);
      await _persist();
    }
  }

  Future<void> clearFavorites() async {
    favoriteIds.clear();
    favoriteFoods.clear();
    await LocalDB.remove(_keyIds);
    await LocalDB.remove(_keyFoods);
  }

  Future<void> _persist() async {
    try {
      await LocalDB.setStringList(_keyIds, favoriteIds.toList());
      final jsonStr = jsonEncode(favoriteFoods.map((f) => f.toJson()).toList());
      await LocalDB.setString(_keyFoods, jsonStr);
    } catch (e) {
      debugPrint('⚠️ [FavoritesService] Failed to persist favorites: $e');
    }
  }
}

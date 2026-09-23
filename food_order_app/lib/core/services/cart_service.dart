import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../../domain/cart/entities/cart_item_entity.dart';
import '../../domain/food/entities/food_entity.dart';
import '../db/local_db.dart';

class CartService extends GetxService {
  static const String _keyCartItems = 'cart_items_data';
  static const double freeDeliveryThreshold = 20.0;
  static const double standardDeliveryFee = 1.50;

  final RxList<CartItemEntity> items = <CartItemEntity>[].obs;

  @override
  void onInit() {
    super.onInit();
    _loadCart();
  }

  // --- Computed Getters ---

  int get totalQuantity => items.fold(0, (sum, i) => sum + i.quantity);

  double get subtotal => items.fold(0.0, (sum, i) => sum + i.totalPrice);

  double get deliveryFee =>
      (subtotal >= freeDeliveryThreshold || items.isEmpty) ? 0.0 : standardDeliveryFee;

  double get totalAmount => subtotal + deliveryFee;

  bool get isEmpty => items.isEmpty;

  bool get isNotEmpty => items.isNotEmpty;

  double get freeDeliveryRemaining =>
      (freeDeliveryThreshold - subtotal).clamp(0.0, freeDeliveryThreshold);

  double get freeDeliveryProgress =>
      (subtotal / freeDeliveryThreshold).clamp(0.0, 1.0);

  // --- Actions ---

  void addItem(
    FoodEntity food, {
    int quantity = 1,
    String specialInstructions = '',
  }) {
    if (food.id.isEmpty || quantity <= 0) return;

    final existingIndex = items.indexWhere(
      (item) =>
          item.food.id == food.id &&
          item.specialInstructions.trim() == specialInstructions.trim(),
    );

    if (existingIndex >= 0) {
      final existing = items[existingIndex];
      items[existingIndex] = existing.copyWith(
        quantity: existing.quantity + quantity,
      );
    } else {
      items.add(
        CartItemEntity(
          food: food,
          quantity: quantity,
          specialInstructions: specialInstructions.trim(),
        ),
      );
    }

    _persist();
    debugPrint('🛒 [CartService] Added ${food.name} (x$quantity). Total: ${items.length} items');
  }

  void incrementQuantity(String foodId) {
    final index = items.indexWhere((item) => item.food.id == foodId);
    if (index >= 0) {
      final current = items[index];
      if (current.quantity < 99) {
        items[index] = current.copyWith(quantity: current.quantity + 1);
        _persist();
      }
    }
  }

  void decrementQuantity(String foodId) {
    final index = items.indexWhere((item) => item.food.id == foodId);
    if (index >= 0) {
      final current = items[index];
      if (current.quantity > 1) {
        items[index] = current.copyWith(quantity: current.quantity - 1);
        _persist();
      } else {
        removeItem(foodId);
      }
    }
  }

  void removeItem(String foodId) {
    items.removeWhere((item) => item.food.id == foodId);
    _persist();
  }

  void clearCart() {
    items.clear();
    _persist();
  }

  // --- Persistence ---

  void _loadCart() {
    try {
      final jsonStr = LocalDB.getString(_keyCartItems);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final List<dynamic> decoded = jsonDecode(jsonStr);
        final loaded = decoded
            .map((item) => CartItemEntity.fromJson(item as Map<String, dynamic>))
            .toList();
        items.assignAll(loaded);
        debugPrint('🛒 [CartService] Loaded ${items.length} cart items from storage');
      }
    } catch (e) {
      debugPrint('⚠️ [CartService] Failed to load cart: $e');
    }
  }

  Future<void> _persist() async {
    try {
      final jsonList = items.map((i) => i.toJson()).toList();
      await LocalDB.setString(_keyCartItems, jsonEncode(jsonList));
    } catch (e) {
      debugPrint('⚠️ [CartService] Failed to persist cart: $e');
    }
  }
}

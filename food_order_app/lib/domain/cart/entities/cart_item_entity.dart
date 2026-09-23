import '../../food/entities/food_entity.dart';

class CartItemEntity {
  final FoodEntity food;
  final int quantity;
  final String specialInstructions;

  const CartItemEntity({
    required this.food,
    this.quantity = 1,
    this.specialInstructions = '',
  });

  double get totalPrice => food.price * quantity;

  CartItemEntity copyWith({
    FoodEntity? food,
    int? quantity,
    String? specialInstructions,
  }) {
    return CartItemEntity(
      food: food ?? this.food,
      quantity: quantity ?? this.quantity,
      specialInstructions: specialInstructions ?? this.specialInstructions,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'food': food.toJson(),
      'quantity': quantity,
      'specialInstructions': specialInstructions,
    };
  }

  factory CartItemEntity.fromJson(Map<String, dynamic> json) {
    return CartItemEntity(
      food: FoodEntity.fromJson(json['food'] as Map<String, dynamic>),
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      specialInstructions: json['specialInstructions'] as String? ?? '',
    );
  }
}

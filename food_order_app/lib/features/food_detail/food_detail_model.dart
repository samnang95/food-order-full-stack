import '../../domain/food/entities/food_entity.dart';

class FoodDetailModel {
  final FoodEntity food;
  final int quantity;
  final bool isFavorite;
  final String specialInstructions;

  const FoodDetailModel({
    required this.food,
    this.quantity = 1,
    this.isFavorite = false,
    this.specialInstructions = '',
  });

  double get totalPrice => food.price * quantity;

  FoodDetailModel copyWith({
    FoodEntity? food,
    int? quantity,
    bool? isFavorite,
    String? specialInstructions,
  }) {
    return FoodDetailModel(
      food: food ?? this.food,
      quantity: quantity ?? this.quantity,
      isFavorite: isFavorite ?? this.isFavorite,
      specialInstructions: specialInstructions ?? this.specialInstructions,
    );
  }
}

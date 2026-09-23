import '../../../domain/food/entities/food_entity.dart';

class FoodResponseModel {
  final String id;
  final String name;
  final String description;
  final double price;
  final String categoryId;
  final String categoryName;
  final String imageUrl;
  final bool isAvailable;

  const FoodResponseModel({
    required this.id,
    required this.name,
    this.description = '',
    required this.price,
    this.categoryId = '',
    this.categoryName = '',
    this.imageUrl = '',
    this.isAvailable = true,
  });

  factory FoodResponseModel.fromJson(Map<String, dynamic> json) {
    String categoryId = '';
    String categoryName = '';
    final category = json['category'];
    if (category is Map<String, dynamic>) {
      categoryId = (category['_id'] ?? category['id'] ?? '').toString();
      categoryName = category['name'] ?? '';
    } else if (category is String) {
      categoryId = category;
    }

    return FoodResponseModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      categoryId: categoryId,
      categoryName: categoryName,
      imageUrl: json['imageUrl'] ?? '',
      isAvailable: json['isAvailable'] ?? true,
    );
  }

  FoodEntity toEntity() {
    return FoodEntity(
      id: id,
      name: name,
      description: description,
      price: price,
      categoryId: categoryId,
      categoryName: categoryName,
      imageUrl: imageUrl,
      isAvailable: isAvailable,
    );
  }
}

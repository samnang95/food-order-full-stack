class FoodEntity {
  final String id;
  final String name;
  final String description;
  final double price;
  final String categoryId;
  final String categoryName;
  final String imageUrl;
  final bool isAvailable;

  const FoodEntity({
    required this.id,
    required this.name,
    this.description = '',
    required this.price,
    this.categoryId = '',
    this.categoryName = '',
    this.imageUrl = '',
    this.isAvailable = true,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'imageUrl': imageUrl,
      'isAvailable': isAvailable,
    };
  }

  factory FoodEntity.fromJson(Map<String, dynamic> json) {
    return FoodEntity(
      id: (json['id'] ?? '').toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      categoryId: json['categoryId'] ?? '',
      categoryName: json['categoryName'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      isAvailable: json['isAvailable'] ?? true,
    );
  }
}

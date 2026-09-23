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
}

class CategoryEntity {
  final String id;
  final String name;
  final String description;
  final String imageUrl;

  const CategoryEntity({
    required this.id,
    required this.name,
    this.description = '',
    this.imageUrl = '',
  });
}

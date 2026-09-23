import '../../../domain/category/entities/category_entity.dart';

class CategoryResponseModel {
  final String id;
  final String name;
  final String description;
  final String imageUrl;

  const CategoryResponseModel({
    required this.id,
    required this.name,
    this.description = '',
    this.imageUrl = '',
  });

  factory CategoryResponseModel.fromJson(Map<String, dynamic> json) {
    return CategoryResponseModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
    );
  }

  CategoryEntity toEntity() {
    return CategoryEntity(
      id: id,
      name: name,
      description: description,
      imageUrl: imageUrl,
    );
  }
}

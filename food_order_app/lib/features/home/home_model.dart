import 'package:equatable/equatable.dart';

class HomeModel extends Equatable {
  final bool isLoading;
  final List<String> categories;
  final String selectedCategory;
  final List<Map<String, dynamic>> popularItems;

  const HomeModel({
    this.isLoading = true,
    this.categories = const [],
    this.selectedCategory = '',
    this.popularItems = const [],
  });

  HomeModel copyWith({
    bool? isLoading,
    List<String>? categories,
    String? selectedCategory,
    List<Map<String, dynamic>>? popularItems,
  }) {
    return HomeModel(
      isLoading: isLoading ?? this.isLoading,
      categories: categories ?? this.categories,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      popularItems: popularItems ?? this.popularItems,
    );
  }

  @override
  List<Object> get props => [isLoading, categories, selectedCategory, popularItems];
}

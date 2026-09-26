import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../../domain/category/entities/category_entity.dart';
import '../../domain/food/entities/food_entity.dart';
import '../../domain/food/usecases/get_foods_usecase.dart';
import '../categories/categories_store.dart';
import 'category_detail_intent.dart';
import 'category_detail_state.dart';

class CategoryDetailStore extends GetxController {
  final GetFoodsUseCase? getFoodsUseCase;

  CategoryDetailStore({this.getFoodsUseCase});

  final Rx<CategoryDetailState> state = const CategoryDetailState().obs;

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments;
    if (args is CategoryEntity) {
      setCategory(args);
    } else if (args is Map && args['name'] != null) {
      setCategory(
        CategoryEntity(
          id: (args['id'] ?? '').toString(),
          name: args['name'] as String,
          description: args['description'] as String? ?? '',
          imageUrl: args['imageUrl'] as String? ?? '',
        ),
      );
    }
  }

  void onIntent(CategoryDetailIntent intent) {
    switch (intent) {
      case CategoryDetailInitialize(:final category):
        setCategory(category);
      case CategoryDetailSortChanged(:final sort):
        setSort(sort);
      case CategoryDetailScrollChanged(:final isScrolled):
        setIsScrolled(isScrolled);
      case CategoryDetailRefreshFoods():
        if (state.value.category != null) {
          loadFoodsForCategory(state.value.category!);
        }
    }
  }

  void setIsScrolled(bool value) {
    if (state.value.isScrolled != value) {
      state.value = state.value.copyWith(isScrolled: value);
    }
  }

  void setCategory(CategoryEntity cat) {
    state.value = state.value.copyWith(category: cat);
    loadFoodsForCategory(cat);
  }

  void setSort(String sort) {
    state.value = state.value.copyWith(selectedSort: sort);
  }

  Future<void> loadFoodsForCategory(CategoryEntity cat) async {
    // 1. If CategoriesStore is registered and loaded, use its cached items
    if (Get.isRegistered<CategoriesStore>()) {
      final catStore = Get.find<CategoriesStore>();
      final matched = catStore.getFoodsForCategory(cat);
      if (matched.isNotEmpty) {
        state.value = state.value.copyWith(foods: matched);
        return;
      }
    }

    // 2. If foods are still empty and getFoodsUseCase is available, fetch from API
    if (state.value.foods.isEmpty) {
      final useCase = getFoodsUseCase ??
          (Get.isRegistered<GetFoodsUseCase>()
              ? Get.find<GetFoodsUseCase>()
              : null);
      if (useCase != null) {
        try {
          state.value = state.value.copyWith(isLoading: true);
          final all = await useCase.execute();
          final matched = all.where((f) {
            if (f.categoryId.isNotEmpty && f.categoryId == cat.id) return true;
            if (f.categoryName.isNotEmpty &&
                f.categoryName.toLowerCase() == cat.name.toLowerCase()) {
              return true;
            }
            return false;
          }).toList();
          state.value = state.value.copyWith(foods: matched);
        } catch (e) {
          debugPrint('⚠️ [CategoryDetailStore] Error loading foods: $e');
        } finally {
          state.value = state.value.copyWith(isLoading: false);
        }
      }
    }
  }

  // Getters for convenience and test backward-compatibility
  CategoryEntity? get category => state.value.category;
  String get selectedSort => state.value.selectedSort;
  List<FoodEntity> get foods => state.value.foods;
  bool get isLoading => state.value.isLoading;
  bool get isScrolled => state.value.isScrolled;
  List<FoodEntity> get sortedFoods => state.value.sortedFoods;
}

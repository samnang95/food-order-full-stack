import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../../domain/category/entities/category_entity.dart';
import '../../domain/food/entities/food_entity.dart';
import '../../domain/food/usecases/get_foods_usecase.dart';
import '../categories/categories_store.dart';

class CategoryDetailStore extends GetxController {
  final GetFoodsUseCase? getFoodsUseCase;

  CategoryDetailStore({this.getFoodsUseCase});

  final category = Rxn<CategoryEntity>();
  final selectedSort = 'all'.obs; // 'all', 'price_asc', 'price_desc'
  final foods = <FoodEntity>[].obs;
  final isLoading = false.obs;
  final isScrolled = false.obs;

  void setIsScrolled(bool value) {
    if (isScrolled.value != value) {
      isScrolled.value = value;
    }
  }

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

  void setCategory(CategoryEntity cat) {
    category.value = cat;
    loadFoodsForCategory(cat);
  }

  void setSort(String sort) {
    selectedSort.value = sort;
  }

  Future<void> loadFoodsForCategory(CategoryEntity cat) async {
    // 1. If CategoriesStore is registered and loaded, use its cached items
    if (Get.isRegistered<CategoriesStore>()) {
      final catStore = Get.find<CategoriesStore>();
      final matched = catStore.getFoodsForCategory(cat);
      if (matched.isNotEmpty) {
        foods.assignAll(matched);
      }
    }

    // 2. If foods are still empty and getFoodsUseCase is available, fetch from API
    if (foods.isEmpty) {
      final useCase = getFoodsUseCase ??
          (Get.isRegistered<GetFoodsUseCase>()
              ? Get.find<GetFoodsUseCase>()
              : null);
      if (useCase != null) {
        try {
          isLoading.value = true;
          final all = await useCase.execute();
          final matched = all.where((f) {
            if (f.categoryId.isNotEmpty && f.categoryId == cat.id) return true;
            if (f.categoryName.isNotEmpty &&
                f.categoryName.toLowerCase() == cat.name.toLowerCase()) {
              return true;
            }
            return false;
          }).toList();
          foods.assignAll(matched);
        } catch (e) {
          debugPrint('⚠️ [CategoryDetailStore] Error loading foods: $e');
        } finally {
          isLoading.value = false;
        }
      }
    }
  }

  List<FoodEntity> get sortedFoods {
    final list = List<FoodEntity>.from(foods);
    switch (selectedSort.value) {
      case 'price_asc':
        list.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => b.price.compareTo(a.price));
        break;
      default:
        break;
    }
    return list;
  }
}

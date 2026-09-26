import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/db/local_db.dart';
import '../../core/services/cart_service.dart';
import '../../domain/category/usecases/get_categories_usecase.dart';
import '../../domain/food/entities/food_entity.dart';
import '../../domain/food/usecases/get_foods_usecase.dart';
import '../../routes/app_routes.dart';
import 'search_intent.dart';
import 'search_state.dart';

class SearchStore extends GetxController {
  final GetFoodsUseCase getFoodsUseCase;
  final GetCategoriesUseCase getCategoriesUseCase;
  final CartService cartService;

  late final TextEditingController textController;
  final FocusNode searchFocusNode = FocusNode();

  SearchStore({
    required this.getFoodsUseCase,
    required this.getCategoriesUseCase,
    CartService? cartService,
  }) : cartService = cartService ??
            (Get.isRegistered<CartService>()
                ? Get.find<CartService>()
                : Get.put(CartService(), permanent: true)) {
    textController = TextEditingController();
  }

  static const String _keyRecentSearches = 'recent_search_queries_list';
  final Rx<SearchState> state = const SearchState().obs;
  Timer? _debounceTimer;

  @override
  void onInit() {
    super.onInit();
    _loadRecentSearches();
    _loadData();
  }

  @override
  void onClose() {
    _debounceTimer?.cancel();
    textController.dispose();
    searchFocusNode.dispose();
    super.onClose();
  }

  void onIntent(SearchIntent intent) {
    switch (intent) {
      case SearchQueryChangedIntent(:final query):
        _onQueryChanged(query);
      case SearchClearQueryIntent():
        textController.clear();
        state.value = state.value.copyWith(query: '');
      case SearchSelectRecentQueryIntent(:final query):
        textController.text = query;
        textController.selection = TextSelection.fromPosition(
          TextPosition(offset: query.length),
        );
        state.value = state.value.copyWith(query: query);
        _saveRecentQuery(query);
      case SearchRemoveRecentQueryIntent(:final query):
        _removeRecentQuery(query);
      case SearchClearAllRecentIntent():
        _clearAllRecent();
      case SearchApplyFilterIntent(:final categoryId, :final minPrice, :final maxPrice, :final sortOption):
        state.value = state.value.copyWith(
          selectedCategoryId: categoryId,
          clearCategoryId: categoryId == null,
          minPrice: minPrice,
          maxPrice: maxPrice,
          sortOption: sortOption,
        );
      case SearchResetFilterIntent():
        state.value = state.value.copyWith(
          clearCategoryId: true,
          minPrice: 0.0,
          maxPrice: 50.0,
          sortOption: SearchSortOption.popular,
        );
      case SearchRefreshIntent():
        _loadData();
    }
  }

  void _onQueryChanged(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 250), () {
      state.value = state.value.copyWith(query: query);
      if (query.trim().length >= 2) {
        _saveRecentQuery(query);
      }
    });
  }

  Future<void> _loadData() async {
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final foodsFuture = getFoodsUseCase.execute();
      final categoriesFuture = getCategoriesUseCase.execute();

      final foods = await foodsFuture;
      final categories = await categoriesFuture;

      state.value = state.value.copyWith(
        allFoods: foods,
        categories: categories,
        isLoading: false,
      );
    } catch (e) {
      state.value = state.value.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  void _loadRecentSearches() {
    try {
      final jsonStr = LocalDB.getString(_keyRecentSearches);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final List<dynamic> list = jsonDecode(jsonStr);
        final searches = list.map((e) => e.toString()).toList();
        state.value = state.value.copyWith(recentSearches: searches);
      }
    } catch (e) {
      debugPrint('⚠️ [SearchStore] Failed to load recent searches: $e');
    }
  }

  void _saveRecentQuery(String query) {
    final trimmed = query.trim();
    if (trimmed.isEmpty) return;

    final current = List<String>.from(state.value.recentSearches);
    current.removeWhere((q) => q.toLowerCase() == trimmed.toLowerCase());
    current.insert(0, trimmed);
    if (current.length > 8) current.removeRange(8, current.length);

    state.value = state.value.copyWith(recentSearches: current);
    LocalDB.setString(_keyRecentSearches, jsonEncode(current));
  }

  void _removeRecentQuery(String query) {
    final current = List<String>.from(state.value.recentSearches);
    current.removeWhere((q) => q.toLowerCase() == query.trim().toLowerCase());
    state.value = state.value.copyWith(recentSearches: current);
    LocalDB.setString(_keyRecentSearches, jsonEncode(current));
  }

  void _clearAllRecent() {
    state.value = state.value.copyWith(recentSearches: const []);
    LocalDB.remove(_keyRecentSearches);
  }

  void addToCart(FoodEntity food) {
    cartService.addItem(food);
    if (Get.context != null) {
      Get.snackbar(
        'Added to Cart',
        '${food.name} was added to your order',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
        borderRadius: 12,
        duration: const Duration(seconds: 2),
        mainButton: TextButton(
          onPressed: () => Get.toNamed(AppRoutes.cart),
          child: const Text(
            'View Cart',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }
  }
}

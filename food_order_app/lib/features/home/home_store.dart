import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../../domain/category/usecases/get_categories_usecase.dart';
import '../../domain/food/usecases/get_foods_usecase.dart';
import 'home_intent.dart';
import 'home_model.dart';

class HomeStore extends GetxController {
  final GetCategoriesUseCase getCategoriesUseCase;
  final GetFoodsUseCase getFoodsUseCase;

  HomeStore({
    required this.getCategoriesUseCase,
    required this.getFoodsUseCase,
  });

  final Rx<HomeModel> state = const HomeModel().obs;

  Timer? _debounce;

  @override
  void onInit() {
    super.onInit();
    onIntent(const HomeLoadData());
  }

  @override
  void onClose() {
    _debounce?.cancel();
    super.onClose();
  }

  void onIntent(HomeIntent intent) {
    switch (intent) {
      case HomeLoadData():
        _onLoadData();
      case HomeRefreshData():
        _onRefreshData();
      case HomeCategorySelected(:final categoryId):
        _onCategorySelected(categoryId);
      case HomeSearchChanged(:final query):
        _onSearchChanged(query);
    }
  }

  Future<void> _onLoadData() async {
    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      // Fetch categories and foods in parallel
      final results = await Future.wait([
        getCategoriesUseCase.execute(),
        getFoodsUseCase.execute(),
      ]);

      final categories = results[0];
      final foods = results[1];

      state.value = state.value.copyWith(
        isLoading: false,
        categories: List.from(categories),
        foods: List.from(foods),
      );

      debugPrint('✅ [HomeStore] Loaded ${categories.length} categories, ${foods.length} foods');
    } catch (e) {
      debugPrint('❌ [HomeStore] Load failed: $e');
      final rawError = e.toString().replaceAll('Exception: ', '');
      String displayError = rawError;

      if (rawError.contains('Connection refused') || rawError.contains('SocketException')) {
        displayError = 'Cannot connect to server. Please check your network or server status.';
      }

      state.value = state.value.copyWith(
        isLoading: false,
        errorMessage: displayError,
      );
    }
  }

  Future<void> _onRefreshData() async {
    try {
      final categoryId = state.value.selectedCategoryId;
      final search = state.value.searchQuery;

      final results = await Future.wait([
        getCategoriesUseCase.execute(),
        getFoodsUseCase.execute(
          category: categoryId.isNotEmpty ? categoryId : null,
          search: search.isNotEmpty ? search : null,
        ),
      ]);

      state.value = state.value.copyWith(
        categories: List.from(results[0]),
        foods: List.from(results[1]),
        errorMessage: null,
      );

      debugPrint('✅ [HomeStore] Refreshed data');
    } catch (e) {
      debugPrint('❌ [HomeStore] Refresh failed: $e');
    }
  }

  Future<void> _onCategorySelected(String categoryId) async {
    if (state.value.selectedCategoryId == categoryId) return;

    state.value = state.value.copyWith(
      selectedCategoryId: categoryId,
      isLoading: true,
      errorMessage: null,
    );

    try {
      final foods = await getFoodsUseCase.execute(
        category: categoryId.isNotEmpty ? categoryId : null,
        search: state.value.searchQuery.isNotEmpty ? state.value.searchQuery : null,
      );

      state.value = state.value.copyWith(
        isLoading: false,
        foods: foods,
      );

      debugPrint('✅ [HomeStore] Category filter → ${foods.length} foods');
    } catch (e) {
      debugPrint('❌ [HomeStore] Category filter failed: $e');
      state.value = state.value.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load foods. Please try again.',
      );
    }
  }

  void _onSearchChanged(String query) {
    state.value = state.value.copyWith(searchQuery: query);

    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      state.value = state.value.copyWith(isLoading: true, errorMessage: null);

      try {
        final foods = await getFoodsUseCase.execute(
          category: state.value.selectedCategoryId.isNotEmpty
              ? state.value.selectedCategoryId
              : null,
          search: query.isNotEmpty ? query : null,
        );

        state.value = state.value.copyWith(
          isLoading: false,
          foods: foods,
        );

        debugPrint('🔍 [HomeStore] Search "$query" → ${foods.length} foods');
      } catch (e) {
        debugPrint('❌ [HomeStore] Search failed: $e');
        state.value = state.value.copyWith(
          isLoading: false,
          errorMessage: 'Search failed. Please try again.',
        );
      }
    });
  }
}

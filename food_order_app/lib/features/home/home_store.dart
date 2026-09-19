import 'package:get/get.dart';
import 'home_intent.dart';
import 'home_model.dart';

class HomeStore extends GetxController {
  final Rx<HomeModel> state = const HomeModel().obs;

  @override
  void onInit() {
    super.onInit();
    onIntent(const HomeLoadData());
  }

  void onIntent(HomeIntent intent) {
    switch (intent) {
      case HomeLoadData():
        _onLoadData();
      case HomeCategorySelected(:final category):
        _onCategorySelected(category);
    }
  }

  Future<void> _onLoadData() async {
    state.value = state.value.copyWith(isLoading: true);
    await Future.delayed(const Duration(milliseconds: 500)); // Simulating network
    
    final categories = ['All', 'Burgers', 'Pizza', 'Asian', 'Healthy', 'Dessert'];
    
    final popularItems = [
      {
        'name': 'Double Cheese Burger',
        'price': 12.99,
        'rating': 4.8,
        'time': '15-20 min',
      },
      {
        'name': 'Margherita Pizza',
        'price': 14.50,
        'rating': 4.6,
        'time': '20-30 min',
      },
      {
        'name': 'Spicy Tuna Roll',
        'price': 18.00,
        'rating': 4.9,
        'time': '10-15 min',
      }
    ];

    state.value = state.value.copyWith(
      isLoading: false,
      categories: categories,
      selectedCategory: 'All',
      popularItems: popularItems,
    );
  }

  void _onCategorySelected(String category) {
    state.value = state.value.copyWith(selectedCategory: category);
  }
}

import 'package:flutter_bloc/flutter_bloc.dart';
import 'home_intent.dart';
import 'home_model.dart';

class HomeStore extends Bloc<HomeIntent, HomeModel> {
  HomeStore() : super(const HomeModel()) {
    on<HomeLoadData>(_onLoadData);
    on<HomeCategorySelected>(_onCategorySelected);
  }

  Future<void> _onLoadData(HomeLoadData intent, Emitter<HomeModel> emit) async {
    emit(state.copyWith(isLoading: true));
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

    emit(state.copyWith(
      isLoading: false,
      categories: categories,
      selectedCategory: 'All',
      popularItems: popularItems,
    ));
  }

  void _onCategorySelected(HomeCategorySelected intent, Emitter<HomeModel> emit) {
    emit(state.copyWith(selectedCategory: intent.category));
  }
}

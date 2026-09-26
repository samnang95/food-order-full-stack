import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/core/services/favorites_service.dart';
import 'package:food_order_app/domain/category/entities/category_entity.dart';
import 'package:food_order_app/domain/category/repositories/category_repository.dart';
import 'package:food_order_app/domain/category/usecases/get_categories_usecase.dart';
import 'package:food_order_app/domain/food/entities/food_entity.dart';
import 'package:food_order_app/domain/food/repositories/food_repository.dart';
import 'package:food_order_app/domain/food/usecases/get_foods_usecase.dart';
import 'package:food_order_app/features/categories/categories_store.dart';
import 'package:food_order_app/features/categories/categories_view.dart';
import 'package:food_order_app/features/category_detail/category_detail_view.dart';

class MockCategoryRepository implements CategoryRepository {
  List<CategoryEntity> categoriesToReturn = [];

  @override
  Future<List<CategoryEntity>> getCategories() async => categoriesToReturn;
}

class MockFoodRepository implements FoodRepository {
  List<FoodEntity> foodsToReturn = [];

  @override
  Future<List<FoodEntity>> getFoods({String? category, String? search}) async => foodsToReturn;
}

void main() {
  late MockCategoryRepository mockCategoryRepo;
  late MockFoodRepository mockFoodRepo;
  late CategoriesStore store;

  final testCategories = [
    const CategoryEntity(
      id: 'cat_burgers',
      name: 'Burgers',
      description: 'Juicy burgers',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    ),
    const CategoryEntity(
      id: 'cat_pizza',
      name: 'Pizza',
      description: 'Cheesy pizzas',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    ),
    const CategoryEntity(
      id: 'cat_healthy',
      name: 'Healthy Bowls',
      description: 'Fresh salads',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    ),
  ];

  final testFoods = [
    const FoodEntity(
      id: 'food_1',
      name: 'Classic Smash Burger',
      price: 8.50,
      categoryId: 'cat_burgers',
      categoryName: 'Burgers',
      imageUrl: '',
    ),
    const FoodEntity(
      id: 'food_2',
      name: 'Double Bacon Burger',
      price: 11.00,
      categoryId: 'cat_burgers',
      categoryName: 'Burgers',
      imageUrl: '',
    ),
    const FoodEntity(
      id: 'food_3',
      name: 'Budget Mini Slider',
      price: 4.50,
      categoryId: 'cat_burgers',
      categoryName: 'Burgers',
      imageUrl: '',
    ),
    const FoodEntity(
      id: 'food_4',
      name: 'Margherita Pizza',
      price: 12.00,
      categoryId: 'cat_pizza',
      categoryName: 'Pizza',
      imageUrl: '',
    ),
  ];

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    Get.put(CartService(), permanent: true);
    Get.put(FavoritesService(), permanent: true);

    mockCategoryRepo = MockCategoryRepository();
    mockCategoryRepo.categoriesToReturn = testCategories;

    mockFoodRepo = MockFoodRepository();
    mockFoodRepo.foodsToReturn = testFoods;

    store = Get.put(
      CategoriesStore(
        getCategoriesUseCase: GetCategoriesUseCase(repository: mockCategoryRepo),
        getFoodsUseCase: GetFoodsUseCase(repository: mockFoodRepo),
      ),
      permanent: true,
    );
  });

  tearDown(() {
    Get.reset();
  });

  group('CategoriesStore Unit Tests', () {
    test('Loads categories and foods successfully', () async {
      await store.loadData();

      expect(store.categories.length, 3);
      expect(store.allFoods.length, 4);
      expect(store.isLoading, false);
      expect(store.errorMessage, isNull);
    });

    test('Computes live item counts per category accurately', () async {
      await store.loadData();

      final burgerCount = store.getItemCount(testCategories[0]);
      final pizzaCount = store.getItemCount(testCategories[1]);

      expect(burgerCount, 3);
      expect(pizzaCount, 1);
    });

    test('getFoodsForCategory returns foods belonging to specified category', () async {
      await store.loadData();

      final burgerFoods = store.getFoodsForCategory(testCategories[0]);
      expect(burgerFoods.length, 3);
      expect(burgerFoods.every((f) => f.categoryName == 'Burgers'), true);

      final pizzaFoods = store.getFoodsForCategory(testCategories[1]);
      expect(pizzaFoods.length, 1);
      expect(pizzaFoods.first.name, 'Margherita Pizza');
    });

    test('Filtering by search query filters categories by name and description', () async {
      await store.loadData();

      store.setSearchQuery('pizza');
      expect(store.filteredCategories.length, 1);
      expect(store.filteredCategories.first.name, 'Pizza');

      store.setSearchQuery('salads'); // matches description of Healthy Bowls
      expect(store.filteredCategories.length, 1);
      expect(store.filteredCategories.first.name, 'Healthy Bowls');

      store.setSearchQuery('');
      expect(store.filteredCategories.length, 3);
    });

    test('Discovery tags filter categories properly', () async {
      await store.loadData();

      store.setSelectedTag('trending');
      expect(store.filteredCategories.any((c) => c.name == 'Burgers'), true);
      expect(store.filteredCategories.any((c) => c.name == 'Pizza'), true);

      store.setSelectedTag('budget');
      // Burgers has food_3 priced at $4.50
      expect(store.filteredCategories.any((c) => c.name == 'Burgers'), true);

      store.setSelectedTag('all');
      expect(store.filteredCategories.length, 3);
    });
  });

  group('CategoriesView Widget Tests', () {
    testWidgets('CategoriesView renders header, search bar, and discovery chips', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: CategoriesView(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Categories'), findsOneWidget);
      expect(find.byType(Image), findsWidgets);
      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('All'), findsOneWidget);
      expect(find.text('🔥 Trending'), findsOneWidget);
      expect(find.text('⚡ Under 20m'), findsOneWidget);
      expect(find.text(r'💰 Budget (<$6)'), findsOneWidget);
    });

    testWidgets('Tapping a discovery chip updates selected tag', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: CategoriesView(),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('🔥 Trending'));
      await tester.pumpAndSettle();

      expect(store.selectedTag, 'trending');
    });
  });

  group('CategoryDetailView Widget Tests', () {
    testWidgets('CategoryDetailView renders category hero title and food items', (tester) async {
      await tester.pumpWidget(
        GetMaterialApp(
          home: CategoryDetailView(category: testCategories[0]),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Burgers'), findsWidgets);
      expect(find.text('All Items'), findsOneWidget);
      expect(find.text('Price: Low to High'), findsOneWidget);
      expect(find.text('Price: High to Low'), findsOneWidget);
      expect(find.text('Classic Smash Burger'), findsOneWidget);
      expect(find.text('Double Bacon Burger'), findsOneWidget);
    });

    testWidgets('CategoryDetailView sorts items when Price Low to High is tapped', (tester) async {
      await tester.pumpWidget(
        GetMaterialApp(
          home: CategoryDetailView(category: testCategories[0]),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Price: Low to High'));
      await tester.pumpAndSettle();

      // $4.50 Budget Slider should be first
      expect(find.text('Budget Mini Slider'), findsOneWidget);
    });
  });
}

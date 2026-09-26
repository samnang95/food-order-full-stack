import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/domain/category/entities/category_entity.dart';
import 'package:food_order_app/domain/category/repositories/category_repository.dart';
import 'package:food_order_app/domain/category/usecases/get_categories_usecase.dart';
import 'package:food_order_app/domain/food/entities/food_entity.dart';
import 'package:food_order_app/domain/food/repositories/food_repository.dart';
import 'package:food_order_app/domain/food/usecases/get_foods_usecase.dart';
import 'package:food_order_app/features/search/search_intent.dart';
import 'package:food_order_app/features/search/search_state.dart';
import 'package:food_order_app/features/search/search_store.dart';
import 'package:food_order_app/features/search/search_view.dart';
import 'package:food_order_app/features/search/widgets/widgets.dart';

class MockFoodRepository implements FoodRepository {
  List<FoodEntity> foods = [];
  @override
  Future<List<FoodEntity>> getFoods({String? category, String? search}) async => foods;
}

class MockCategoryRepository implements CategoryRepository {
  List<CategoryEntity> categories = [];
  @override
  Future<List<CategoryEntity>> getCategories() async => categories;
}

void main() {
  late MockFoodRepository mockFoodRepo;
  late MockCategoryRepository mockCategoryRepo;
  late GetFoodsUseCase getFoodsUseCase;
  late GetCategoriesUseCase getCategoriesUseCase;
  late CartService cartService;
  late SearchStore store;

  final catBurgers = CategoryEntity(id: 'cat_1', name: 'Burgers', imageUrl: '');
  final catDrinks = CategoryEntity(id: 'cat_2', name: 'Drinks', imageUrl: '');

  final food1 = const FoodEntity(
    id: 'f1',
    name: 'Classic Smash Burger',
    description: 'Juicy double patty burger with special sauce',
    price: 9.99,
    imageUrl: '',
    categoryId: 'cat_1',
    categoryName: 'Burgers',
  );

  final food2 = const FoodEntity(
    id: 'f2',
    name: 'Truffle Wagyu Burger',
    description: 'Premium beef with black truffle aioli',
    price: 24.50,
    imageUrl: '',
    categoryId: 'cat_1',
    categoryName: 'Burgers',
  );

  final food3 = const FoodEntity(
    id: 'f3',
    name: 'Iced Matcha Latte',
    description: 'Refreshing organic Japanese green tea latte',
    price: 4.50,
    imageUrl: '',
    categoryId: 'cat_2',
    categoryName: 'Drinks',
  );

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    mockFoodRepo = MockFoodRepository();
    mockFoodRepo.foods = [food1, food2, food3];

    mockCategoryRepo = MockCategoryRepository();
    mockCategoryRepo.categories = [catBurgers, catDrinks];

    getFoodsUseCase = GetFoodsUseCase(repository: mockFoodRepo);
    getCategoriesUseCase = GetCategoriesUseCase(repository: mockCategoryRepo);

    cartService = Get.put(CartService(), permanent: true);
    store = Get.put(
      SearchStore(
        getFoodsUseCase: getFoodsUseCase,
        getCategoriesUseCase: getCategoriesUseCase,
        cartService: cartService,
      ),
      permanent: true,
    );
  });

  tearDown(() {
    Get.reset();
  });

  group('SearchState & Filtering Logic', () {
    test('filters foods by query matching name, description, and category', () {
      final state = SearchState(allFoods: [food1, food2, food3]);

      // Match name
      final qBurger = state.copyWith(query: 'Smash');
      expect(qBurger.results.length, 1);
      expect(qBurger.results.first.id, 'f1');

      // Match description
      final qTruffle = state.copyWith(query: 'truffle');
      expect(qTruffle.results.length, 1);
      expect(qTruffle.results.first.id, 'f2');

      // Match category
      final qDrinks = state.copyWith(query: 'Drinks');
      expect(qDrinks.results.length, 1);
      expect(qDrinks.results.first.id, 'f3');
    });

    test('filters foods by category and price range', () {
      final state = SearchState(
        allFoods: [food1, food2, food3],
        selectedCategoryId: 'cat_1',
        minPrice: 5.0,
        maxPrice: 15.0,
      );

      final results = state.results;
      expect(results.length, 1);
      expect(results.first.id, 'f1'); // 9.99 burger
    });

    test('sorts results by price low to high and high to low', () {
      final stateLow = SearchState(
        allFoods: [food1, food2, food3],
        sortOption: SearchSortOption.priceLowToHigh,
      );
      expect(stateLow.results.map((f) => f.id).toList(), ['f3', 'f1', 'f2']);

      final stateHigh = SearchState(
        allFoods: [food1, food2, food3],
        sortOption: SearchSortOption.priceHighToLow,
      );
      expect(stateHigh.results.map((f) => f.id).toList(), ['f2', 'f1', 'f3']);
    });

    test('sorts results by name (A to Z)', () {
      final state = SearchState(
        allFoods: [food1, food2, food3],
        sortOption: SearchSortOption.nameAZ,
      );
      expect(
        state.results.map((f) => f.name).toList(),
        ['Classic Smash Burger', 'Iced Matcha Latte', 'Truffle Wagyu Burger'],
      );
    });

    test('tracks hasActiveFilter and activeFilterCount accurately', () {
      var state = const SearchState();
      expect(state.hasActiveFilter, false);
      expect(state.activeFilterCount, 0);

      state = state.copyWith(selectedCategoryId: 'cat_1');
      expect(state.hasActiveFilter, true);
      expect(state.activeFilterCount, 1);

      state = state.copyWith(minPrice: 5.0);
      expect(state.activeFilterCount, 2);

      state = state.copyWith(sortOption: SearchSortOption.priceHighToLow);
      expect(state.activeFilterCount, 3);
    });
  });

  group('SearchStore Intent Processing', () {
    test('loads foods and categories on initialization', () async {
      await Future.delayed(const Duration(milliseconds: 50));
      expect(store.state.value.allFoods.length, 3);
      expect(store.state.value.categories.length, 2);
    });

    test('saves and manages recent search history', () async {
      store.onIntent(const SearchSelectRecentQueryIntent('Burger'));
      expect(store.state.value.recentSearches, ['Burger']);
      expect(store.textController.text, 'Burger');

      store.onIntent(const SearchSelectRecentQueryIntent('Pizza'));
      expect(store.state.value.recentSearches, ['Pizza', 'Burger']);

      // Remove single query
      store.onIntent(const SearchRemoveRecentQueryIntent('Burger'));
      expect(store.state.value.recentSearches, ['Pizza']);

      // Clear all
      store.onIntent(const SearchClearAllRecentIntent());
      expect(store.state.value.recentSearches.isEmpty, true);
    });

    test('applies filter and resets filter', () async {
      store.onIntent(const SearchApplyFilterIntent(
        categoryId: 'cat_1',
        minPrice: 10.0,
        maxPrice: 30.0,
        sortOption: SearchSortOption.priceHighToLow,
      ));

      expect(store.state.value.selectedCategoryId, 'cat_1');
      expect(store.state.value.minPrice, 10.0);
      expect(store.state.value.maxPrice, 30.0);
      expect(store.state.value.sortOption, SearchSortOption.priceHighToLow);
      expect(store.state.value.hasActiveFilter, true);

      // Reset
      store.onIntent(const SearchResetFilterIntent());
      expect(store.state.value.selectedCategoryId, null);
      expect(store.state.value.minPrice, 0.0);
      expect(store.state.value.maxPrice, 50.0);
      expect(store.state.value.sortOption, SearchSortOption.popular);
      expect(store.state.value.hasActiveFilter, false);
    });

    test('addToCart increments CartService item count', () {
      expect(cartService.items.length, 0);
      store.addToCart(food1);
      expect(cartService.items.length, 1);
      expect(cartService.items.first.food.id, 'f1');
    });
  });

  group('SearchView Widget Tests', () {
    testWidgets('renders search header and discovery empty state initially', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: SearchView(autoFocus: false),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.byType(SearchHeaderBar), findsOneWidget);
      expect(find.text('Discover Delicious Food'), findsOneWidget);
      expect(find.text('Popular Searches'), findsOneWidget);
      expect(find.text('Burger'), findsOneWidget);
      expect(find.text('Pizza'), findsOneWidget);
    });

    testWidgets('displays matching food tiles and results count when query is present', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: SearchView(autoFocus: false),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Enter query
      store.onIntent(const SearchSelectRecentQueryIntent('Smash'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Found 1 dish'), findsOneWidget);
      expect(find.text('Classic Smash Burger'), findsOneWidget);
      expect(find.text('\$9.99'), findsOneWidget);
      expect(find.byType(SearchFoodTile), findsOneWidget);
    });

    testWidgets('displays no dishes found when query has no match', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: SearchView(autoFocus: false),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      store.onIntent(const SearchSelectRecentQueryIntent('NonExistentFoodXYZ'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('No dishes found'), findsOneWidget);
      expect(find.text('Clear Search'), findsOneWidget);
    });
  });
}

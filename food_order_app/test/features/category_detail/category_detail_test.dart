import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/core/services/favorites_service.dart';
import 'package:food_order_app/domain/category/entities/category_entity.dart';
import 'package:food_order_app/domain/food/entities/food_entity.dart';
import 'package:food_order_app/domain/food/repositories/food_repository.dart';
import 'package:food_order_app/domain/food/usecases/get_foods_usecase.dart';
import 'package:food_order_app/features/category_detail/category_detail_binding.dart';
import 'package:food_order_app/features/category_detail/category_detail_store.dart';
import 'package:food_order_app/features/category_detail/category_detail_view.dart';

class MockFoodRepository implements FoodRepository {
  List<FoodEntity> foodsToReturn = [];

  @override
  Future<List<FoodEntity>> getFoods({String? category, String? search}) async => foodsToReturn;
}

void main() {
  late MockFoodRepository mockFoodRepo;
  late GetFoodsUseCase getFoodsUseCase;
  late CategoryDetailStore store;

  const testCategory = CategoryEntity(
    id: 'cat_burgers',
    name: 'Burgers',
    description: 'Juicy burgers',
    imageUrl: '',
  );

  final List<FoodEntity> testFoods = [
    const FoodEntity(
      id: 'food_1',
      name: 'Classic Smash Burger',
      categoryId: 'cat_burgers',
      categoryName: 'Burgers',
      price: 8.50,
      isAvailable: true,
      imageUrl: '',
    ),
    const FoodEntity(
      id: 'food_2',
      name: 'Double Bacon Burger',
      categoryId: 'cat_burgers',
      categoryName: 'Burgers',
      price: 11.00,
      isAvailable: true,
      imageUrl: '',
    ),
    const FoodEntity(
      id: 'food_3',
      name: 'Budget Slider',
      categoryId: 'cat_burgers',
      categoryName: 'Burgers',
      price: 4.50,
      isAvailable: true,
      imageUrl: '',
    ),
  ];

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    Get.put(CartService(), permanent: true);
    Get.put(FavoritesService(), permanent: true);

    mockFoodRepo = MockFoodRepository()..foodsToReturn = testFoods;
    getFoodsUseCase = GetFoodsUseCase(repository: mockFoodRepo);
    store = CategoryDetailStore(getFoodsUseCase: getFoodsUseCase);
    Get.put<CategoryDetailStore>(store);
  });

  tearDown(() {
    Get.reset();
  });

  group('CategoryDetailStore Tests', () {
    test('Loads and filters foods for category', () async {
      await store.loadFoodsForCategory(testCategory);

      expect(store.foods.length, 3);
      expect(store.sortedFoods.length, 3);
    });

    test('Sorts foods by Price Low to High', () async {
      await store.loadFoodsForCategory(testCategory);

      store.setSort('price_asc');
      expect(store.sortedFoods.first.name, 'Budget Slider');
      expect(store.sortedFoods.last.name, 'Double Bacon Burger');
    });

    test('Sorts foods by Price High to Low', () async {
      await store.loadFoodsForCategory(testCategory);

      store.setSort('price_desc');
      expect(store.sortedFoods.first.name, 'Double Bacon Burger');
      expect(store.sortedFoods.last.name, 'Budget Slider');
    });
  });

  group('CategoryDetailBinding Tests', () {
    test('Registers CategoryDetailStore in GetX', () {
      Get.reset();
      Get.put<GetFoodsUseCase>(getFoodsUseCase);
      final binding = CategoryDetailBinding();
      binding.dependencies();

      expect(Get.isRegistered<CategoryDetailStore>(), true);
    });
  });

  group('CategoryDetailView Widget Tests', () {
    testWidgets('Renders hero category title and food items', (tester) async {
      await store.loadFoodsForCategory(testCategory);

      await tester.pumpWidget(
        const GetMaterialApp(
          home: CategoryDetailView(category: testCategory),
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

    testWidgets('Sorts items dynamically when Price Low to High chip is tapped', (tester) async {
      await store.loadFoodsForCategory(testCategory);

      await tester.pumpWidget(
        const GetMaterialApp(
          home: CategoryDetailView(category: testCategory),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Price: Low to High'));
      await tester.pumpAndSettle();

      expect(find.text('Budget Slider'), findsOneWidget);
    });
  });
}

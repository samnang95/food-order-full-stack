import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/core/services/favorites_service.dart';
import 'package:food_order_app/domain/food/entities/food_entity.dart';
import 'package:food_order_app/features/favorites/favorites_binding.dart';
import 'package:food_order_app/features/favorites/favorites_intent.dart';
import 'package:food_order_app/features/favorites/favorites_store.dart';
import 'package:food_order_app/features/favorites/favorites_view.dart';

void main() {
  late FavoritesService favoritesService;
  late CartService cartService;
  late FavoritesStore store;

  const testFood1 = FoodEntity(
    id: 'food_1',
    name: 'Truffle Burger',
    categoryId: 'cat_burgers',
    categoryName: 'Burgers',
    price: 12.50,
    imageUrl: '',
  );

  const testFood2 = FoodEntity(
    id: 'food_2',
    name: 'Cheesy Pepperoni Pizza',
    categoryId: 'cat_pizza',
    categoryName: 'Pizza',
    price: 15.00,
    imageUrl: '',
  );

  const testFood3 = FoodEntity(
    id: 'food_3',
    name: 'Avocado Salad Bowl',
    categoryId: 'cat_healthy',
    categoryName: 'Healthy',
    price: 8.00,
    imageUrl: '',
  );

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    favoritesService = Get.put(FavoritesService(), permanent: true);
    cartService = Get.put(CartService(), permanent: true);
    store = Get.put(FavoritesStore(), permanent: true);
  });

  tearDown(() {
    Get.reset();
  });

  group('FavoritesStore Unit Tests', () {
    test('Stores and retrieves favorites from FavoritesService', () async {
      expect(store.filteredFoods.isEmpty, true);

      await favoritesService.toggleFavorite(testFood1);
      await favoritesService.toggleFavorite(testFood2);

      expect(store.filteredFoods.length, 2);
      expect(store.availableCategories.contains('Burgers'), true);
      expect(store.availableCategories.contains('Pizza'), true);
    });

    test('Filters favorites by search query using MVI intent', () async {
      await favoritesService.toggleFavorite(testFood1);
      await favoritesService.toggleFavorite(testFood2);
      await favoritesService.toggleFavorite(testFood3);

      store.onIntent(const FavoritesSearchChanged('burger'));
      expect(store.filteredFoods.length, 1);
      expect(store.filteredFoods.first.name, 'Truffle Burger');
      expect(store.state.value.searchQuery, 'burger');

      store.onIntent(const FavoritesClearSearch());
      expect(store.filteredFoods.length, 3);
      expect(store.state.value.searchQuery, '');
    });

    test('Filters favorites by category using MVI intent', () async {
      await favoritesService.toggleFavorite(testFood1);
      await favoritesService.toggleFavorite(testFood2);
      await favoritesService.toggleFavorite(testFood3);

      store.onIntent(const FavoritesCategorySelected('Pizza'));
      expect(store.filteredFoods.length, 1);
      expect(store.filteredFoods.first.name, 'Cheesy Pepperoni Pizza');
      expect(store.state.value.selectedCategory, 'Pizza');

      store.onIntent(const FavoritesCategorySelected('all'));
      expect(store.filteredFoods.length, 3);
      expect(store.state.value.selectedCategory, 'all');
    });

    test('Sorts favorites by price using MVI intent', () async {
      await favoritesService.toggleFavorite(testFood1); // $12.50
      await favoritesService.toggleFavorite(testFood2); // $15.00
      await favoritesService.toggleFavorite(testFood3); // $8.00

      store.onIntent(const FavoritesSortChanged('price_asc'));
      expect(store.filteredFoods.first.name, 'Avocado Salad Bowl');
      expect(store.filteredFoods.last.name, 'Cheesy Pepperoni Pizza');

      store.onIntent(const FavoritesSortChanged('price_desc'));
      expect(store.filteredFoods.first.name, 'Cheesy Pepperoni Pizza');
      expect(store.filteredFoods.last.name, 'Avocado Salad Bowl');
    });

    test('addAllToCart adds all filtered favorites into cart using MVI intent', () async {
      await favoritesService.toggleFavorite(testFood1);
      await favoritesService.toggleFavorite(testFood2);

      expect(cartService.items.isEmpty, true);
      store.onIntent(const FavoritesAddAllToCart());

      expect(cartService.items.length, 2);
      expect(cartService.items.any((i) => i.food.id == 'food_1'), true);
      expect(cartService.items.any((i) => i.food.id == 'food_2'), true);
    });

    test('removeFavorite and clearAll properly updates store using MVI intent', () async {
      await favoritesService.toggleFavorite(testFood1);
      await favoritesService.toggleFavorite(testFood2);

      store.onIntent(const FavoritesRemoveItem('food_1'));
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(store.filteredFoods.length, 1);
      expect(store.filteredFoods.first.id, 'food_2');

      store.onIntent(const FavoritesClearAll());
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(store.filteredFoods.isEmpty, true);
    });
  });

  group('FavoritesBinding Tests', () {
    test('Registers FavoritesStore properly', () {
      Get.reset();
      final binding = FavoritesBinding();
      binding.dependencies();

      expect(Get.isRegistered<FavoritesStore>(), true);
    });
  });

  group('FavoritesView Widget Tests', () {
    testWidgets('Renders empty state when no items are favorited', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: FavoritesView(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('My Favorites'), findsOneWidget);
      expect(find.text('Your Wishlist is Empty'), findsOneWidget);
      expect(find.text('Explore Food Feed'), findsOneWidget);
    });

    testWidgets('Renders favorites grid when items are present', (tester) async {
      await favoritesService.toggleFavorite(testFood1);
      await favoritesService.toggleFavorite(testFood2);

      await tester.pumpWidget(
        const GetMaterialApp(
          home: FavoritesView(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('My Favorites'), findsOneWidget);
      expect(find.text('2'), findsOneWidget); // badge
      expect(find.text('Truffle Burger'), findsOneWidget);
      expect(find.text('Cheesy Pepperoni Pizza'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
    });
  });
}

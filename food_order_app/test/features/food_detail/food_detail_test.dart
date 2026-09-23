import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/favorites_service.dart';
import 'package:food_order_app/domain/food/entities/food_entity.dart';
import 'package:food_order_app/features/food_detail/food_detail_intent.dart';
import 'package:food_order_app/features/food_detail/food_detail_store.dart';

void main() {
  const sampleFood = FoodEntity(
    id: 'food_1',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with melted cheddar',
    price: 8.50,
    categoryId: 'cat_1',
    categoryName: 'Burgers',
    imageUrl: 'https://example.com/burger.jpg',
  );

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();
    Get.put(FavoritesService(), permanent: true);
  });

  tearDown(() {
    Get.reset();
  });

  test('FoodDetailStore initializes correctly with arguments', () {
    Get.routing.args = sampleFood;
    final store = FoodDetailStore();
    store.onInit();

    expect(store.state.value.food.id, 'food_1');
    expect(store.state.value.food.name, 'Classic Cheeseburger');
    expect(store.state.value.quantity, 1);
    expect(store.state.value.totalPrice, 8.50);
    expect(store.state.value.isFavorite, false);
  });

  test('FoodDetailIncrementQty increments quantity and recalculates totalPrice', () {
    Get.routing.args = sampleFood;
    final store = FoodDetailStore();
    store.onInit();

    store.onIntent(const FoodDetailIncrementQty());
    expect(store.state.value.quantity, 2);
    expect(store.state.value.totalPrice, 17.00);

    store.onIntent(const FoodDetailIncrementQty());
    expect(store.state.value.quantity, 3);
    expect(store.state.value.totalPrice, 25.50);
  });

  test('FoodDetailDecrementQty decrements quantity but never goes below 1', () {
    Get.routing.args = sampleFood;
    final store = FoodDetailStore();
    store.onInit();

    // Already at 1, decrement should stay at 1
    store.onIntent(const FoodDetailDecrementQty());
    expect(store.state.value.quantity, 1);
    expect(store.state.value.totalPrice, 8.50);

    // Increment then decrement
    store.onIntent(const FoodDetailIncrementQty());
    expect(store.state.value.quantity, 2);
    store.onIntent(const FoodDetailDecrementQty());
    expect(store.state.value.quantity, 1);
  });

  test('FoodDetailSpecialInstructionsChanged updates instructions', () {
    Get.routing.args = sampleFood;
    final store = FoodDetailStore();
    store.onInit();

    store.onIntent(const FoodDetailSpecialInstructionsChanged('No pickles, please'));
    expect(store.state.value.specialInstructions, 'No pickles, please');
  });

  test('Toggle favorite saves food to FavoritesService and persists to LocalDB', () async {
    Get.routing.args = sampleFood;
    final store = FoodDetailStore();
    store.onInit();

    final favService = Get.find<FavoritesService>();
    expect(favService.isFavorite('food_1'), false);

    // Toggle favorite ON
    store.onIntent(const FoodDetailToggleFavorite());
    await Future.delayed(const Duration(milliseconds: 50));

    expect(store.state.value.isFavorite, true);
    expect(favService.isFavorite('food_1'), true);
    expect(LocalDB.getStringList('favorite_food_ids')?.contains('food_1'), true);

    // New store instance should load as favorite: true
    final store2 = FoodDetailStore();
    store2.onInit();
    expect(store2.state.value.isFavorite, true);

    // Toggle favorite OFF
    store.onIntent(const FoodDetailToggleFavorite());
    await Future.delayed(const Duration(milliseconds: 50));

    expect(store.state.value.isFavorite, false);
    expect(favService.isFavorite('food_1'), false);
    expect(LocalDB.getStringList('favorite_food_ids')?.contains('food_1'), false);
  });
}

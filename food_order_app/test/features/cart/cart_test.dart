import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/core/widgets/floating_cart_bar.dart';
import 'package:food_order_app/domain/food/entities/food_entity.dart';
import 'package:food_order_app/features/cart/cart_intent.dart';
import 'package:food_order_app/features/cart/cart_store.dart';

void main() {
  const burger = FoodEntity(
    id: 'food_burger',
    name: 'Truffle Burger',
    price: 12.00,
  );

  const fries = FoodEntity(
    id: 'food_fries',
    name: 'Crispy Fries',
    price: 4.50,
  );

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();
    Get.put(CartService(), permanent: true);
  });

  tearDown(() {
    Get.reset();
  });

  test('CartService initially empty with 0 totals', () {
    final cartService = Get.find<CartService>();

    expect(cartService.isEmpty, true);
    expect(cartService.totalQuantity, 0);
    expect(cartService.subtotal, 0.0);
    expect(cartService.deliveryFee, 0.0);
    expect(cartService.totalAmount, 0.0);
  });

  test('Adding items updates quantities and charges standard delivery fee when below threshold', () {
    final cartService = Get.find<CartService>();

    cartService.addItem(burger, quantity: 1);

    expect(cartService.items.length, 1);
    expect(cartService.totalQuantity, 1);
    expect(cartService.subtotal, 12.00);
    // Below $20.00 threshold, delivery fee is $1.50
    expect(cartService.deliveryFee, 1.50);
    expect(cartService.totalAmount, 13.50);
    expect(cartService.freeDeliveryRemaining, 8.00);
  });

  test('Free delivery unlocked when subtotal reaches or exceeds \$20.00', () {
    final cartService = Get.find<CartService>();

    cartService.addItem(burger, quantity: 2); // 2 x 12 = $24.00

    expect(cartService.subtotal, 24.00);
    expect(cartService.deliveryFee, 0.00);
    expect(cartService.totalAmount, 24.00);
    expect(cartService.freeDeliveryRemaining, 0.00);
    expect(cartService.freeDeliveryProgress, 1.0);
  });

  test('Adding same item increments quantity instead of duplicate entry', () {
    final cartService = Get.find<CartService>();

    cartService.addItem(burger, quantity: 1);
    cartService.addItem(burger, quantity: 2);

    expect(cartService.items.length, 1);
    expect(cartService.totalQuantity, 3);
    expect(cartService.items.first.quantity, 3);
    expect(cartService.subtotal, 36.00);
  });

  test('Increment, decrement, and remove item work properly', () {
    final cartService = Get.find<CartService>();

    cartService.addItem(burger, quantity: 2);
    cartService.addItem(fries, quantity: 1);

    expect(cartService.items.length, 2);
    expect(cartService.totalQuantity, 3);

    // Increment fries
    cartService.incrementQuantity('food_fries');
    expect(cartService.items.firstWhere((i) => i.food.id == 'food_fries').quantity, 2);

    // Decrement burger
    cartService.decrementQuantity('food_burger');
    expect(cartService.items.firstWhere((i) => i.food.id == 'food_burger').quantity, 1);

    // Decrement burger again (should remove it)
    cartService.decrementQuantity('food_burger');
    expect(cartService.items.any((i) => i.food.id == 'food_burger'), false);
    expect(cartService.items.length, 1);

    // Remove fries explicitly
    cartService.removeItem('food_fries');
    expect(cartService.isEmpty, true);
  });

  test('Cart persists across service re-initialization via LocalDB', () async {
    final cartService = Get.find<CartService>();
    cartService.addItem(burger, quantity: 2, specialInstructions: 'Well done');

    await Future.delayed(const Duration(milliseconds: 50));

    // Create a new CartService instance to simulate app restart
    final newCartService = CartService();
    newCartService.onInit();

    expect(newCartService.items.length, 1);
    expect(newCartService.items.first.food.name, 'Truffle Burger');
    expect(newCartService.items.first.quantity, 2);
    expect(newCartService.items.first.specialInstructions, 'Well done');
    expect(newCartService.subtotal, 24.00);
  });

  test('CartStore handles intents correctly', () {
    final store = CartStore();
    final cartService = store.cartService;

    cartService.addItem(burger, quantity: 2);

    store.onIntent(const CartIncrementQty('food_burger'));
    expect(cartService.items.first.quantity, 3);

    store.onIntent(const CartDecrementQty('food_burger'));
    expect(cartService.items.first.quantity, 2);

    store.onIntent(const CartRemoveItem('food_burger'));
    expect(cartService.isEmpty, true);
  });

  testWidgets('FloatingCartBar renders correctly in Light Mode with items', (tester) async {
    final cartService = Get.find<CartService>();
    cartService.addItem(burger, quantity: 2);

    await tester.pumpWidget(
      const GetMaterialApp(
        themeMode: ThemeMode.light,
        home: Scaffold(
          body: FloatingCartBar(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('2 items in cart'), findsOneWidget);
    expect(find.text('View Cart'), findsOneWidget);
  });

  testWidgets('FloatingCartBar renders correctly in Dark Mode with items', (tester) async {
    final cartService = Get.find<CartService>();
    cartService.addItem(burger, quantity: 1);

    await tester.pumpWidget(
      GetMaterialApp(
        themeMode: ThemeMode.dark,
        darkTheme: ThemeData.dark(),
        home: const Scaffold(
          body: FloatingCartBar(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('1 item in cart'), findsOneWidget);
    expect(find.text('View Cart'), findsOneWidget);
  });
}

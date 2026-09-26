import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/domain/food/entities/food_entity.dart';
import 'package:food_order_app/domain/order/entities/order_entity.dart';
import 'package:food_order_app/domain/order/repositories/order_repository.dart';
import 'package:food_order_app/features/checkout/checkout_intent.dart';
import 'package:food_order_app/features/checkout/checkout_store.dart';
import 'package:food_order_app/features/checkout/widgets/checkout_preferences_card.dart';

class MockOrderRepo implements OrderRepository {
  String? lastAddress;

  @override
  Future<OrderEntity> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
    double? deliveryLat,
    double? deliveryLng,
    String? voucherCode,
  }) async {
    lastAddress = deliveryAddress;
    return OrderEntity(
      id: 'order_pref_123',
      userId: 'user_pref',
      items: const [],
      totalAmount: 15.0,
      deliveryAddress: deliveryAddress,
      status: 'pending',
      paymentMethod: paymentMethod,
      paymentStatus: 'pending',
      createdAt: DateTime.now(),
    );
  }

  @override
  Future<List<OrderEntity>> getMyOrders() async => [];
  @override
  Future<OrderEntity> getOrderById(String orderId) async => throw UnimplementedError();
  @override
  Future<OrderEntity> cancelOrder(String orderId) async => throw UnimplementedError();
}

void main() {
  late MockOrderRepo mockRepo;
  late CheckoutStore checkoutStore;
  late CartService cartService;

  const foodItem = FoodEntity(
    id: 'food_pizza',
    name: 'Margherita Pizza',
    price: 15.0,
  );

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    mockRepo = MockOrderRepo();
    cartService = Get.put(CartService(), permanent: true);
    checkoutStore = Get.put(CheckoutStore(orderRepository: mockRepo));
  });

  tearDown(() {
    Get.reset();
  });

  group('Checkout Preferences Store & Intent Tests', () {
    test('Default state has cutlery disabled and empty preferences', () {
      final state = checkoutStore.state.value;
      expect(state.requestCutlery, isFalse);
      expect(state.cutleryCount, 1);
      expect(state.kitchenNote, isEmpty);
      expect(state.kitchenPreferences, isEmpty);
      expect(state.selectedCondiments, isEmpty);
    });

    test('ToggleCutleryIntent updates requestCutlery flag', () {
      checkoutStore.onIntent(const ToggleCutleryIntent(true));
      expect(checkoutStore.state.value.requestCutlery, isTrue);

      checkoutStore.onIntent(const ToggleCutleryIntent(false));
      expect(checkoutStore.state.value.requestCutlery, isFalse);
    });

    test('UpdateCutleryCountIntent clamps count between 1 and 10', () {
      checkoutStore.onIntent(const UpdateCutleryCountIntent(4));
      expect(checkoutStore.state.value.cutleryCount, 4);

      checkoutStore.onIntent(const UpdateCutleryCountIntent(15));
      expect(checkoutStore.state.value.cutleryCount, 10);

      checkoutStore.onIntent(const UpdateCutleryCountIntent(-2));
      expect(checkoutStore.state.value.cutleryCount, 1);
    });

    test('ChangeKitchenNoteIntent updates kitchen note', () {
      checkoutStore.onIntent(const ChangeKitchenNoteIntent('Crispy crust please'));
      expect(checkoutStore.state.value.kitchenNote, 'Crispy crust please');
    });

    test('ToggleKitchenPreferenceIntent adds and removes preference tags', () {
      checkoutStore.onIntent(const ToggleKitchenPreferenceIntent('🌶️ Less Spicy'));
      expect(checkoutStore.state.value.kitchenPreferences, contains('🌶️ Less Spicy'));

      checkoutStore.onIntent(const ToggleKitchenPreferenceIntent('🧅 No Onions'));
      expect(checkoutStore.state.value.kitchenPreferences.length, 2);

      // Toggling again removes it
      checkoutStore.onIntent(const ToggleKitchenPreferenceIntent('🌶️ Less Spicy'));
      expect(checkoutStore.state.value.kitchenPreferences, isNot(contains('🌶️ Less Spicy')));
      expect(checkoutStore.state.value.kitchenPreferences, contains('🧅 No Onions'));
    });

    test('ToggleCondimentIntent adds and removes condiments', () {
      checkoutStore.onIntent(const ToggleCondimentIntent('🍅 Tomato Ketchup'));
      expect(checkoutStore.state.value.selectedCondiments, contains('🍅 Tomato Ketchup'));

      checkoutStore.onIntent(const ToggleCondimentIntent('🍅 Tomato Ketchup'));
      expect(checkoutStore.state.value.selectedCondiments, isNot(contains('🍅 Tomato Ketchup')));
    });

    test('SubmitOrder formats delivery address with all active preferences', () async {
      cartService.addItem(foodItem, quantity: 1);
      checkoutStore.onIntent(const ChangeDeliveryAddress('Building 5A, Phnom Penh'));
      checkoutStore.onIntent(const ChangeDeliveryNote('Gate 1'));
      checkoutStore.onIntent(const ToggleCutleryIntent(true));
      checkoutStore.onIntent(const UpdateCutleryCountIntent(2));
      checkoutStore.onIntent(const ToggleKitchenPreferenceIntent('🌶️ Less Spicy'));
      checkoutStore.onIntent(const ChangeKitchenNoteIntent('Well cooked'));
      checkoutStore.onIntent(const ToggleCondimentIntent('🌶️ Chili Sauce'));

      checkoutStore.onIntent(const SubmitOrder());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(mockRepo.lastAddress, isNotNull);
      expect(mockRepo.lastAddress, contains('Building 5A, Phnom Penh'));
      expect(mockRepo.lastAddress, contains('Gate 1'));
      expect(mockRepo.lastAddress, contains('Cutlery: 2 sets'));
      expect(mockRepo.lastAddress, contains('Prep: 🌶️ Less Spicy'));
      expect(mockRepo.lastAddress, contains('Kitchen: Well cooked'));
      expect(mockRepo.lastAddress, contains('Extras: 🌶️ Chili Sauce'));
    });
  });

  group('CheckoutPreferencesCard Widget Tests', () {
    testWidgets('Renders header, eco notice, condiments, and kitchen instructions', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CheckoutPreferencesCard(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Cutlery & Order Notes'), findsOneWidget);
      expect(find.text('Include Cutlery & Utensils'), findsOneWidget);
      expect(find.textContaining('Eco Choice'), findsOneWidget);
      expect(find.text('Condiments & Extras'), findsOneWidget);
      expect(find.text('Cooking & Kitchen Instructions'), findsOneWidget);
    });

    testWidgets('Toggling Cutlery switch displays counter controls', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CheckoutPreferencesCard(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Initially eco banner is present, counter is not
      expect(find.textContaining('Eco Choice'), findsOneWidget);
      expect(find.byIcon(Icons.add_rounded), findsNothing);

      // Tap switch
      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.requestCutlery, isTrue);
      expect(find.textContaining('Number of cutlery sets'), findsOneWidget);
      expect(find.text('1'), findsOneWidget);

      // Tap '+' button to increment
      await tester.tap(find.byIcon(Icons.add_rounded));
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.cutleryCount, 2);
      expect(find.text('2'), findsOneWidget);
    });

    testWidgets('Tapping condiment and kitchen preference chips toggles state', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CheckoutPreferencesCard(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Chili Sauce chip
      await tester.tap(find.text('🌶️ Chili Sauce'));
      await tester.pumpAndSettle();
      expect(checkoutStore.state.value.selectedCondiments, contains('🌶️ Chili Sauce'));

      // Tap Less Spicy chip
      await tester.tap(find.text('🌶️ Less Spicy'));
      await tester.pumpAndSettle();
      expect(checkoutStore.state.value.kitchenPreferences, contains('🌶️ Less Spicy'));
    });

    testWidgets('Entering kitchen note updates text in state and allows clear', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CheckoutPreferencesCard(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final inputFinder = find.byType(TextField);
      expect(inputFinder, findsOneWidget);

      await tester.enterText(inputFinder, 'Pack sauce separately');
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.kitchenNote, 'Pack sauce separately');

      // Clear button should be visible
      final clearFinder = find.byIcon(Icons.clear_rounded);
      expect(clearFinder, findsOneWidget);

      await tester.tap(clearFinder);
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.kitchenNote, isEmpty);
    });
  });
}

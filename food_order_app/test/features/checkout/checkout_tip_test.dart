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
import 'package:food_order_app/features/checkout/widgets/checkout_tip_card.dart';

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
      id: 'order_tip_123',
      userId: 'user_tip',
      items: const [],
      totalAmount: 20.0,
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

  const food = FoodEntity(
    id: 'food_pasta',
    name: 'Truffle Pasta',
    price: 10.0,
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

  group('Checkout Tip Store & Calculation Tests', () {
    test('Default driver tip is 0.0', () {
      expect(checkoutStore.state.value.driverTip, 0.0);
    });

    test('SelectTipIntent updates driverTip and recalculates finalTotal', () {
      cartService.addItem(food, quantity: 1); // subtotal: 10.00, deliveryFee: 1.50
      expect(checkoutStore.finalTotal, 11.50);

      checkoutStore.onIntent(const SelectTipIntent(2.0));
      expect(checkoutStore.state.value.driverTip, 2.0);
      expect(checkoutStore.finalTotal, 13.50);

      checkoutStore.onIntent(const SelectTipIntent(3.50));
      expect(checkoutStore.state.value.driverTip, 3.50);
      expect(checkoutStore.finalTotal, 15.00);
    });

    test('ClearTipIntent resets driverTip to 0.0', () {
      checkoutStore.onIntent(const SelectTipIntent(2.0));
      expect(checkoutStore.state.value.driverTip, 2.0);

      checkoutStore.onIntent(const ClearTipIntent());
      expect(checkoutStore.state.value.driverTip, 0.0);
    });

    test('Negative tip amount clamps to 0.0', () {
      checkoutStore.onIntent(const SelectTipIntent(-5.0));
      expect(checkoutStore.state.value.driverTip, 0.0);
    });

    test('SubmitOrder includes tip in order notes when tip is greater than zero', () async {
      cartService.addItem(food, quantity: 1);
      checkoutStore.onIntent(const ChangeDeliveryAddress('Street 51, Phnom Penh'));
      checkoutStore.onIntent(const SelectTipIntent(2.50));

      checkoutStore.onIntent(const SubmitOrder());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(mockRepo.lastAddress, isNotNull);
      expect(mockRepo.lastAddress, contains('Tip: \$2.50'));
    });
  });

  group('CheckoutTipCard Widget Tests', () {
    testWidgets('Renders header and preset tip chips', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CheckoutTipCard(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Tip Your Rider'), findsOneWidget);
      expect(find.text('No Tip'), findsOneWidget);
      expect(find.text('\$1'), findsOneWidget);
      expect(find.text('\$2'), findsOneWidget);
      expect(find.text('\$3'), findsOneWidget);
      expect(find.text('Custom'), findsOneWidget);
      expect(find.textContaining('Thank you!'), findsNothing);
    });

    testWidgets('Tapping preset chip selects tip and reveals thank you banner', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CheckoutTipCard(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap $2 chip
      await tester.tap(find.text('\$2'));
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.driverTip, 2.0);
      expect(find.textContaining('Thank you! Your \$2.00 tip'), findsOneWidget);

      // Tap No Tip chip
      await tester.tap(find.text('No Tip'));
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.driverTip, 0.0);
      expect(find.textContaining('Thank you!'), findsNothing);
    });

    testWidgets('Tapping Custom reveals input field and quick add chips', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CheckoutTipCard(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Custom chip
      await tester.tap(find.text('Custom'));
      await tester.pumpAndSettle();

      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('+\$1'), findsOneWidget);
      expect(find.text('+\$2'), findsOneWidget);

      // Tap +$1 chip
      await tester.tap(find.text('+\$1'));
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.driverTip, 1.0);
      expect(find.textContaining('Thank you! Your \$1.00 tip'), findsOneWidget);
    });
  });
}

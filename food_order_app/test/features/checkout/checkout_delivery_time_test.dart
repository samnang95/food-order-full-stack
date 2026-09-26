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
import 'package:food_order_app/features/checkout/widgets/checkout_delivery_time_card.dart';

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
      id: 'order_sched_123',
      userId: 'user_sched',
      items: const [],
      totalAmount: 18.0,
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
    id: 'food_ramen',
    name: 'Spicy Tonkotsu Ramen',
    price: 12.0,
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

  group('Checkout Delivery Timing Store & Intent Tests', () {
    test('Default mode is Deliver Now (not scheduled)', () {
      final state = checkoutStore.state.value;
      expect(state.isScheduled, isFalse);
      expect(state.scheduledDate, isNull);
      expect(state.scheduledTimeSlot, isNull);
    });

    test('SelectDeliveryModeIntent(true) activates scheduling with default slot', () {
      checkoutStore.onIntent(const SelectDeliveryModeIntent(isScheduled: true));

      final state = checkoutStore.state.value;
      expect(state.isScheduled, isTrue);
      expect(state.scheduledDate, 'Today');
      expect(state.scheduledTimeSlot, isNotNull);
    });

    test('SelectScheduleTimeSlotIntent updates date and slot', () {
      checkoutStore.onIntent(const SelectScheduleTimeSlotIntent(
        date: 'Tomorrow',
        timeSlot: '6:30 PM - 7:00 PM',
      ));

      final state = checkoutStore.state.value;
      expect(state.isScheduled, isTrue);
      expect(state.scheduledDate, 'Tomorrow');
      expect(state.scheduledTimeSlot, '6:30 PM - 7:00 PM');
    });

    test('SelectDeliveryModeIntent(false) switches back to instant mode', () {
      checkoutStore.onIntent(const SelectDeliveryModeIntent(isScheduled: true));
      expect(checkoutStore.state.value.isScheduled, isTrue);

      checkoutStore.onIntent(const SelectDeliveryModeIntent(isScheduled: false));
      expect(checkoutStore.state.value.isScheduled, isFalse);
    });

    test('SubmitOrder includes schedule info in address notes when scheduled', () async {
      cartService.addItem(foodItem, quantity: 1);
      checkoutStore.onIntent(const ChangeDeliveryAddress('Russian Market, Phnom Penh'));
      checkoutStore.onIntent(const SelectScheduleTimeSlotIntent(
        date: 'Tomorrow',
        timeSlot: '1:00 PM - 1:30 PM',
      ));

      checkoutStore.onIntent(const SubmitOrder());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(mockRepo.lastAddress, isNotNull);
      expect(mockRepo.lastAddress, contains('Russian Market, Phnom Penh'));
      expect(mockRepo.lastAddress, contains('Schedule: Tomorrow, 1:00 PM - 1:30 PM'));
    });
  });

  group('CheckoutDeliveryTimeCard Widget Tests', () {
    testWidgets('Renders header, Deliver Now tab, and instant arrival note', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CheckoutDeliveryTimeCard(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Delivery Timing'), findsOneWidget);
      expect(find.text('Deliver Now'), findsOneWidget);
      expect(find.text('Schedule Later'), findsOneWidget);
      expect(find.textContaining('Instant'), findsWidgets);
      expect(find.textContaining('20 - 35 mins'), findsWidgets);
    });

    testWidgets('Tapping Schedule Later switches tab and reveals slots and guarantee notice', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: CheckoutDeliveryTimeCard(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Schedule Later tab
      await tester.tap(find.text('Schedule Later'));
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.isScheduled, isTrue);
      expect(find.text('Select Date'), findsOneWidget);
      expect(find.text('Select Time Slot'), findsOneWidget);
      expect(find.textContaining('Fresh cooking'), findsOneWidget);

      // Verify preset time slots exist
      expect(find.text('12:00 PM - 12:30 PM'), findsOneWidget);
      expect(find.text('6:00 PM - 6:30 PM'), findsOneWidget);

      // Tap a time slot
      await tester.tap(find.text('6:00 PM - 6:30 PM'));
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.scheduledTimeSlot, '6:00 PM - 6:30 PM');

      // Tap Deliver Now to return to instant mode
      await tester.tap(find.text('Deliver Now'));
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.isScheduled, isFalse);
      expect(find.text('Select Time Slot'), findsNothing);
    });
  });
}

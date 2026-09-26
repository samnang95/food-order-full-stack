import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:food_order_app/domain/order/entities/order_entity.dart';
import 'package:food_order_app/domain/order/repositories/order_repository.dart';
import 'package:food_order_app/features/order_detail/order_detail_intent.dart';
import 'package:food_order_app/features/order_detail/order_detail_store.dart';
import 'package:food_order_app/features/order_detail/widgets/order_cancellation_bottom_sheet.dart';

class MockCancelOrderRepository implements OrderRepository {
  String? cancelledId;
  OrderEntity? lastCancelledReturn;

  @override
  Future<OrderEntity> cancelOrder(String orderId) async {
    cancelledId = orderId;
    return lastCancelledReturn ??
        OrderEntity(
          id: orderId,
          userId: 'u1',
          items: const [],
          totalAmount: 32.50,
          deliveryAddress: 'Street 271, Phnom Penh',
          status: 'cancelled',
          paymentMethod: 'card',
          paymentStatus: 'refunded',
          createdAt: DateTime.now(),
        );
  }

  @override
  Future<OrderEntity> getOrderById(String orderId) async => throw UnimplementedError();

  @override
  Future<List<OrderEntity>> getMyOrders() async => throw UnimplementedError();

  @override
  Future<OrderEntity> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
    double? deliveryLat,
    double? deliveryLng,
    String? voucherCode,
  }) async => throw UnimplementedError();
}

void main() {
  late MockCancelOrderRepository mockRepo;

  final sampleOrder = OrderEntity(
    id: 'ord_canc_123',
    userId: 'u1',
    items: const [
      OrderItemEntity(
        id: 'i1',
        foodId: 'f1',
        foodName: 'Classic Burger',
        foodImageUrl: '',
        price: 15.0,
        quantity: 2,
      ),
    ],
    totalAmount: 30.0,
    deliveryAddress: 'Street 271, Phnom Penh',
    status: 'pending',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    createdAt: DateTime.now(),
  );

  setUp(() {
    Get.testMode = true;
    mockRepo = MockCancelOrderRepository();
  });

  tearDown(() {
    Get.reset();
  });

  group('OrderDetailStore Cancellation & Refund Logic', () {
    test('CancelOrderIntent cancels order and sets refundedAmount and reason', () async {
      final store = Get.put(OrderDetailStore(
        orderRepository: mockRepo,
        initialOrder: sampleOrder,
      ));

      expect(store.state.value.order.status, 'pending');

      store.onIntent(const CancelOrderIntent('Delivery time is taking too long'));
      await Future.delayed(const Duration(milliseconds: 50));

      expect(mockRepo.cancelledId, 'ord_canc_123');
      expect(store.state.value.order.status, 'cancelled');
      expect(store.state.value.cancellationReason, 'Delivery time is taking too long');
      expect(store.state.value.refundedAmount, 30.0);
    });

    test('ConfirmCancelOrderIntent cancels order with given reason', () async {
      final store = Get.put(OrderDetailStore(
        orderRepository: mockRepo,
        initialOrder: sampleOrder,
      ));

      store.onIntent(const ConfirmCancelOrderIntent(reason: 'Changed mind'));
      await Future.delayed(const Duration(milliseconds: 50));

      expect(mockRepo.cancelledId, 'ord_canc_123');
      expect(store.state.value.order.status, 'cancelled');
      expect(store.state.value.cancellationReason, 'Changed mind');
      expect(store.state.value.refundedAmount, 30.0);
    });

    test('Cannot cancel order when status is preparing or out_for_delivery', () async {
      final preparingOrder = OrderEntity(
        id: 'ord_prep_456',
        userId: 'u1',
        items: sampleOrder.items,
        totalAmount: sampleOrder.totalAmount,
        deliveryAddress: sampleOrder.deliveryAddress,
        status: 'preparing',
        paymentMethod: 'card',
        paymentStatus: 'paid',
        createdAt: sampleOrder.createdAt,
      );

      final store = Get.put(OrderDetailStore(
        orderRepository: mockRepo,
        initialOrder: preparingOrder,
      ));

      store.onIntent(const CancelOrderIntent());
      await Future.delayed(const Duration(milliseconds: 50));

      expect(mockRepo.cancelledId, isNull);
      expect(store.state.value.order.status, 'preparing');
    });
  });

  group('OrderCancellationBottomSheet Widget Tests', () {
    testWidgets('Renders refund breakdown, reason items, and confirms cancellation', (tester) async {
      tester.view.physicalSize = const Size(800, 1000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      String? confirmedReason;

      await tester.pumpWidget(
        GetMaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    OrderCancellationBottomSheet.show(
                      context: context,
                      order: sampleOrder,
                      onConfirm: (reason) {
                        confirmedReason = reason;
                      },
                    );
                  },
                  child: const Text('Open Sheet'),
                );
              },
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Open bottom sheet
      await tester.tap(find.text('Open Sheet'));
      await tester.pumpAndSettle();

      // Verify Header & Refund card
      expect(find.text('Cancel Order & Refund'), findsOneWidget);
      expect(find.text('Order ${sampleOrder.shortId} • \$30.00'), findsOneWidget);
      expect(find.text('100% Full Refund Guaranteed'), findsOneWidget);
      expect(find.text('CARD'), findsOneWidget);
      expect(find.text('\$30.00'), findsWidgets);

      // Verify Reason items
      expect(find.text('Delivery time is taking too long'), findsOneWidget);
      expect(find.text('I changed my mind / ordered by mistake'), findsOneWidget);
      expect(find.text('Need to change delivery address or notes'), findsOneWidget);
      expect(find.text('Other reason'), findsOneWidget);

      // Select "I changed my mind / ordered by mistake"
      await tester.ensureVisible(find.text('I changed my mind / ordered by mistake'));
      await tester.tap(find.text('I changed my mind / ordered by mistake'));
      await tester.pumpAndSettle();

      // Tap Confirm Cancellation
      await tester.ensureVisible(find.text('Confirm Cancellation & Refund (\$30.00)'));
      await tester.tap(find.text('Confirm Cancellation & Refund (\$30.00)'));
      await tester.pumpAndSettle();

      expect(confirmedReason, 'I changed my mind / ordered by mistake');
      expect(find.text('Cancel Order & Refund'), findsNothing);
    });

    testWidgets('Other reason displays custom text field and passes text on confirm', (tester) async {
      tester.view.physicalSize = const Size(800, 1000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      String? confirmedReason;

      await tester.pumpWidget(
        GetMaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    OrderCancellationBottomSheet.show(
                      context: context,
                      order: sampleOrder,
                      onConfirm: (reason) {
                        confirmedReason = reason;
                      },
                    );
                  },
                  child: const Text('Open Sheet'),
                );
              },
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Open Sheet'));
      await tester.pumpAndSettle();

      // Select "Other reason"
      await tester.ensureVisible(find.text('Other reason'));
      await tester.tap(find.text('Other reason'));
      await tester.pumpAndSettle();

      // Custom input field should appear
      expect(find.byType(TextField), findsOneWidget);
      await tester.enterText(find.byType(TextField), 'Restaurant called about stock');
      await tester.pumpAndSettle();

      // Confirm
      await tester.ensureVisible(find.text('Confirm Cancellation & Refund (\$30.00)'));
      await tester.tap(find.text('Confirm Cancellation & Refund (\$30.00)'));
      await tester.pumpAndSettle();

      expect(confirmedReason, 'Restaurant called about stock');
    });

    testWidgets('Keep My Order dismisses sheet without calling onConfirm', (tester) async {
      tester.view.physicalSize = const Size(800, 1000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      String? confirmedReason;

      await tester.pumpWidget(
        GetMaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    OrderCancellationBottomSheet.show(
                      context: context,
                      order: sampleOrder,
                      onConfirm: (reason) {
                        confirmedReason = reason;
                      },
                    );
                  },
                  child: const Text('Open Sheet'),
                );
              },
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Open Sheet'));
      await tester.pumpAndSettle();

      // Tap Keep My Order
      await tester.ensureVisible(find.text('Keep My Order'));
      await tester.tap(find.text('Keep My Order'));
      await tester.pumpAndSettle();

      expect(confirmedReason, isNull);
      expect(find.text('Cancel Order & Refund'), findsNothing);
    });
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:food_order_app/domain/order/entities/order_entity.dart';
import 'package:food_order_app/features/order_detail/widgets/order_tracking_stepper.dart';

void main() {
  setUp(() {
    Get.testMode = true;
  });

  tearDown(() {
    Get.reset();
  });

  OrderEntity createOrder({required String status}) {
    return OrderEntity(
      id: 'ord_test_123',
      userId: 'u1',
      items: const [
        OrderItemEntity(
          id: 'i1',
          foodId: 'f1',
          foodName: 'Burger',
          foodImageUrl: '',
          price: 10.0,
          quantity: 1,
        ),
      ],
      totalAmount: 10.0,
      deliveryAddress: 'Street 271, Phnom Penh',
      status: status,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      createdAt: DateTime.now(),
    );
  }

  testWidgets('OrderTrackingStepper renders pending stage with horizontal track and full breakdown', (tester) async {
    final order = createOrder(status: 'pending');

    await tester.pumpWidget(
      GetMaterialApp(
        home: Scaffold(
          body: OrderTrackingStepper(order: order, isCompact: false),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Live Delivery Status'), findsOneWidget);
    expect(find.text('LIVE'), findsOneWidget);
    expect(find.text('25-35 mins'), findsOneWidget);
    expect(find.text('Accepted'), findsOneWidget);
    expect(find.text('Order Received & Confirmed'), findsOneWidget);
    expect(find.text('Placed'), findsOneWidget);
    expect(find.text('Cooking'), findsOneWidget);
    expect(find.text('On Way'), findsOneWidget);
    expect(find.text('Delivered'), findsNWidgets(2)); // Short label and vertical step title
    expect(find.text('Order Placed'), findsOneWidget);
    expect(find.text('Kitchen Preparing'), findsOneWidget);
    expect(find.text('On the Way'), findsOneWidget);
  });

  testWidgets('OrderTrackingStepper renders preparing stage correctly', (tester) async {
    final order = createOrder(status: 'preparing');

    await tester.pumpWidget(
      GetMaterialApp(
        home: Scaffold(
          body: OrderTrackingStepper(order: order, isCompact: false),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Live Delivery Status'), findsOneWidget);
    expect(find.text('LIVE'), findsOneWidget);
    expect(find.text('20-30 mins'), findsOneWidget);
    expect(find.text('Preparing'), findsOneWidget);
    expect(find.text('Kitchen is Preparing'), findsOneWidget);
  });

  testWidgets('OrderTrackingStepper renders out_for_delivery stage with rider marker and en route callout', (tester) async {
    final order = createOrder(status: 'out_for_delivery');

    await tester.pumpWidget(
      GetMaterialApp(
        home: Scaffold(
          body: OrderTrackingStepper(order: order, isCompact: false),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Live Delivery Status'), findsOneWidget);
    expect(find.text('LIVE'), findsOneWidget);
    expect(find.text('10-15 mins'), findsOneWidget);
    expect(find.text('Rider En Route'), findsOneWidget);
    expect(find.text('Rider is on the Way'), findsOneWidget);
    expect(find.byIcon(Icons.two_wheeler_rounded), findsWidgets);
  });

  testWidgets('OrderTrackingStepper renders delivered stage', (tester) async {
    final order = createOrder(status: 'delivered');

    await tester.pumpWidget(
      GetMaterialApp(
        home: Scaffold(
          body: OrderTrackingStepper(order: order, isCompact: false),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Live Delivery Status'), findsOneWidget);
    expect(find.text('LIVE'), findsNothing);
    expect(find.text('Order Delivered'), findsOneWidget);
    expect(find.byIcon(Icons.check_circle_outline_rounded), findsOneWidget);
  });

  testWidgets('OrderTrackingStepper renders cancelled state card when order is cancelled', (tester) async {
    final order = createOrder(status: 'cancelled');

    await tester.pumpWidget(
      GetMaterialApp(
        home: Scaffold(
          body: OrderTrackingStepper(order: order, isCompact: false),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Order Cancelled'), findsOneWidget);
    expect(find.text('This order was cancelled and is no longer active.'), findsOneWidget);
    expect(find.text('Live Delivery Status'), findsNothing);
    expect(find.text('LIVE'), findsNothing);
  });

  testWidgets('OrderTrackingStepper renders in compact mode without vertical timeline', (tester) async {
    final order = createOrder(status: 'preparing');

    await tester.pumpWidget(
      GetMaterialApp(
        home: Scaffold(
          body: OrderTrackingStepper(order: order, isCompact: true),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Live Delivery Status'), findsOneWidget);
    expect(find.text('LIVE'), findsOneWidget);
    expect(find.text('Kitchen is Preparing'), findsOneWidget);
    expect(find.text('Cooking'), findsOneWidget);
    // Vertical timeline is not rendered in compact mode
    expect(find.byType(ListView), findsNothing);
    expect(find.text('Restaurant accepted'), findsNothing);
    expect(find.text('Chef is cooking your meal'), findsNothing);
  });
}

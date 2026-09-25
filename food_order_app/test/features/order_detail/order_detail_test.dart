import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/core/services/socket_service.dart';
import 'package:food_order_app/domain/order/entities/order_entity.dart';
import 'package:food_order_app/domain/order/repositories/order_repository.dart';
import 'package:food_order_app/features/order_detail/order_detail_intent.dart';
import 'package:food_order_app/features/order_detail/order_detail_store.dart';
import 'package:food_order_app/features/order_detail/order_detail_view.dart';

class MockOrderRepository implements OrderRepository {
  OrderEntity? orderToReturn;
  String? cancelledOrderId;

  @override
  Future<OrderEntity> getOrderById(String orderId) async => orderToReturn!;

  @override
  Future<OrderEntity> cancelOrder(String orderId) async {
    cancelledOrderId = orderId;
    return OrderEntity(
      id: orderId,
      userId: 'u1',
      items: orderToReturn?.items ?? [],
      totalAmount: orderToReturn?.totalAmount ?? 20.0,
      deliveryAddress: orderToReturn?.deliveryAddress ?? '',
      status: 'cancelled',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      createdAt: DateTime.now(),
    );
  }

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
  late MockOrderRepository mockRepo;
  late CartService cartService;

  final sampleOrder = OrderEntity(
    id: 'ord_12345',
    userId: 'u1',
    items: const [
      OrderItemEntity(
        id: 'i1',
        foodId: 'f1',
        foodName: 'Truffle Burger',
        foodImageUrl: '',
        price: 12.0,
        quantity: 2,
      ),
      OrderItemEntity(
        id: 'i2',
        foodId: 'f2',
        foodName: 'Crispy Fries',
        foodImageUrl: '',
        price: 4.5,
        quantity: 1,
      ),
    ],
    totalAmount: 28.5,
    deliveryAddress: 'Street 271, Phnom Penh',
    status: 'pending',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    createdAt: DateTime.now(),
  );

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();
    dotenv.loadFromString(envString: 'BASE_URL=http://localhost:3000');

    mockRepo = MockOrderRepository();
    mockRepo.orderToReturn = sampleOrder;
    cartService = Get.put(CartService(), permanent: true);
  });

  tearDown(() {
    SocketService.instance.disconnect();
    Get.reset();
  });

  test('OrderDetailStore initializes with initial order', () {
    final store = Get.put(OrderDetailStore(
      orderRepository: mockRepo,
      initialOrder: sampleOrder,
    ));

    expect(store.state.value.order.id, 'ord_12345');
    expect(store.state.value.order.items.length, 2);
    expect(store.state.value.order.status, 'pending');
    expect(store.state.value.isLoading, false);
  });

  test('RefreshOrderDetailIntent fetches updated order from repository', () async {
    final store = Get.put(OrderDetailStore(
      orderRepository: mockRepo,
      initialOrder: sampleOrder,
    ));

    mockRepo.orderToReturn = OrderEntity(
      id: 'ord_12345',
      userId: 'u1',
      items: sampleOrder.items,
      totalAmount: sampleOrder.totalAmount,
      deliveryAddress: sampleOrder.deliveryAddress,
      status: 'preparing',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      createdAt: sampleOrder.createdAt,
    );

    store.onIntent(const RefreshOrderDetailIntent());
    await Future.delayed(const Duration(milliseconds: 50));

    expect(store.state.value.order.status, 'preparing');
    expect(store.state.value.order.statusLabel, 'Kitchen Preparing');
  });

  test('ReorderItemsIntent adds all order items back into CartService', () {
    final store = Get.put(OrderDetailStore(
      orderRepository: mockRepo,
      initialOrder: sampleOrder,
    ));

    expect(cartService.isEmpty, true);

    store.onIntent(const ReorderItemsIntent());

    expect(cartService.isEmpty, false);
    expect(cartService.items.length, 2);
    expect(cartService.totalQuantity, 3);
    expect(cartService.subtotal, 28.5);
  });

  testWidgets('OrderDetailView renders stepper, address, items, and cancel button for pending order', (tester) async {
    Get.put(OrderDetailStore(
      orderRepository: mockRepo,
      initialOrder: sampleOrder,
    ));

    await tester.pumpWidget(
      const GetMaterialApp(
        home: OrderDetailView(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Order #BC-2345'), findsOneWidget);
    expect(find.text('Live Delivery Status'), findsOneWidget);
    expect(find.text('Order Placed'), findsOneWidget);
    expect(find.text('Delivery Location'), findsOneWidget);
    expect(find.text('Street 271, Phnom Penh'), findsOneWidget);
    expect(find.text('Items Ordered (3)'), findsOneWidget);
    expect(find.text('Truffle Burger'), findsOneWidget);
    expect(find.text('Crispy Fries'), findsOneWidget);
    expect(find.text('Total Paid'), findsOneWidget);
    expect(find.text('\$28.50'), findsOneWidget);
    expect(find.text('Cancel Order'), findsOneWidget);
  });

  testWidgets('OrderDetailView renders Reorder All Items button for delivered order', (tester) async {
    final deliveredOrder = OrderEntity(
      id: 'ord_delivered',
      userId: 'u1',
      items: sampleOrder.items,
      totalAmount: 28.5,
      deliveryAddress: 'Street 271, Phnom Penh',
      status: 'delivered',
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      createdAt: DateTime.now(),
    );

    Get.put(OrderDetailStore(
      orderRepository: mockRepo,
      initialOrder: deliveredOrder,
    ));

    await tester.pumpWidget(
      const GetMaterialApp(
        home: OrderDetailView(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Reorder All Items'), findsOneWidget);
    expect(find.text('Cancel Order'), findsNothing);
  });

  testWidgets('OrderDetailView renders RiderContactCard and interacts with chat and call sheets for out_for_delivery order', (tester) async {
    final deliveringOrder = OrderEntity(
      id: 'ord_delivering',
      userId: 'u1',
      items: sampleOrder.items,
      totalAmount: 28.5,
      deliveryAddress: 'Street 271, Phnom Penh',
      status: 'out_for_delivery',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      createdAt: DateTime.now(),
    );

    Get.put(OrderDetailStore(
      orderRepository: mockRepo,
      initialOrder: deliveringOrder,
    ));

    await tester.pumpWidget(
      const GetMaterialApp(
        home: OrderDetailView(),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Your Delivery Rider'), findsOneWidget);
    expect(find.text('Sok Dara'), findsOneWidget);
    expect(find.byIcon(Icons.chat_bubble_rounded), findsOneWidget);
    expect(find.byIcon(Icons.phone_in_talk_rounded), findsOneWidget);

    // Tap Chat button
    await tester.tap(find.byIcon(Icons.chat_bubble_rounded));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text("I'm waiting downstairs"), findsOneWidget);

    // Tap Close chat
    await tester.tap(find.byIcon(Icons.close_rounded));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    // Tap Call button
    await tester.tap(find.byIcon(Icons.phone_in_talk_rounded));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.byIcon(Icons.call_end_rounded), findsOneWidget);

    // End call
    await tester.tap(find.byIcon(Icons.call_end_rounded));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    SocketService.instance.disconnect();
  });
}

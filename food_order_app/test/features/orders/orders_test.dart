import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/domain/order/entities/order_entity.dart';
import 'package:food_order_app/domain/order/repositories/order_repository.dart';
import 'package:food_order_app/features/orders/orders_intent.dart';
import 'package:food_order_app/features/orders/orders_store.dart';
import 'package:food_order_app/features/orders/orders_view.dart';

class MockOrderRepository implements OrderRepository {
  List<OrderEntity> mockOrders = [];

  @override
  Future<List<OrderEntity>> getMyOrders() async => mockOrders;

  @override
  Future<OrderEntity> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
  }) async => throw UnimplementedError();

  @override
  Future<OrderEntity> getOrderById(String orderId) async => throw UnimplementedError();
}

void main() {
  late MockOrderRepository mockRepo;
  late OrdersStore ordersStore;

  final activeOrder = OrderEntity(
    id: '67890active',
    userId: 'user1',
    items: [
      const OrderItemEntity(
        id: 'i1',
        foodId: 'f1',
        foodName: 'Truffle Burger',
        foodImageUrl: '',
        price: 12.00,
        quantity: 2,
      ),
    ],
    totalAmount: 24.00,
    deliveryAddress: 'Street 271, Phnom Penh',
    status: 'pending',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    createdAt: DateTime.now(),
  );

  final completedOrder = OrderEntity(
    id: '12345done',
    userId: 'user1',
    items: [
      const OrderItemEntity(
        id: 'i2',
        foodId: 'f2',
        foodName: 'Crispy Fries',
        foodImageUrl: '',
        price: 4.50,
        quantity: 1,
      ),
    ],
    totalAmount: 4.50,
    deliveryAddress: 'Street 271, Phnom Penh',
    status: 'delivered',
    paymentMethod: 'khqr',
    paymentStatus: 'completed',
    createdAt: DateTime.now().subtract(const Duration(days: 1)),
  );

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    mockRepo = MockOrderRepository();
    mockRepo.mockOrders = [activeOrder, completedOrder];

    ordersStore = Get.put(OrdersStore(orderRepository: mockRepo));
  });

  tearDown(() {
    Get.reset();
  });

  test('OrdersStore loads orders on init', () async {
    await Future.delayed(const Duration(milliseconds: 50));
    expect(ordersStore.state.value.orders.length, 2);
    expect(ordersStore.state.value.activeCount, 1);
    expect(ordersStore.state.value.completedCount, 1);
  });

  test('Filter tabs correctly filter active and completed orders', () async {
    await Future.delayed(const Duration(milliseconds: 50));

    // Filter 0: All
    expect(ordersStore.state.value.filteredOrders.length, 2);

    // Filter 1: Active
    ordersStore.onIntent(const ChangeOrdersFilterIntent(1));
    expect(ordersStore.state.value.filteredOrders.length, 1);
    expect(ordersStore.state.value.filteredOrders.first.id, '67890active');

    // Filter 2: Completed
    ordersStore.onIntent(const ChangeOrdersFilterIntent(2));
    expect(ordersStore.state.value.filteredOrders.length, 1);
    expect(ordersStore.state.value.filteredOrders.first.id, '12345done');
  });

  testWidgets('OrdersView renders order cards with shortId and status', (tester) async {
    await tester.pumpWidget(
      const GetMaterialApp(
        home: OrdersView(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('My Orders'), findsOneWidget);
    expect(find.text('All (2)'), findsOneWidget);
    expect(find.text('Active (1)'), findsOneWidget);
    expect(find.text('Completed (1)'), findsOneWidget);
    expect(find.text('2x Truffle Burger'), findsOneWidget);
    expect(find.text('Order Placed'), findsOneWidget);
  });
}

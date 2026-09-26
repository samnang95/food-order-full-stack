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
import 'package:food_order_app/features/checkout/checkout_view.dart';
import 'package:food_order_app/features/checkout/order_success_view.dart';
import 'package:food_order_app/routes/app_routes.dart';

class MockOrderRepository implements OrderRepository {
  List<Map<String, dynamic>>? lastItems;
  String? lastAddress;
  String? lastPaymentMethod;
  double? lastLat;
  double? lastLng;
  String? lastVoucherCode;
  bool shouldThrow = false;

  @override
  Future<OrderEntity> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
    double? deliveryLat,
    double? deliveryLng,
    String? voucherCode,
  }) async {
    if (shouldThrow) {
      throw Exception('Server connection failed');
    }
    lastItems = items;
    lastAddress = deliveryAddress;
    lastPaymentMethod = paymentMethod;
    lastLat = deliveryLat;
    lastLng = deliveryLng;
    lastVoucherCode = voucherCode;

    return OrderEntity(
      id: '67890abcdef',
      userId: 'user123',
      items: [
        const OrderItemEntity(
          id: 'item1',
          foodId: 'food_burger',
          foodName: 'Truffle Burger',
          foodImageUrl: '',
          price: 12.00,
          quantity: 2,
        ),
      ],
      totalAmount: 24.00,
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
  const burger = FoodEntity(
    id: 'food_burger',
    name: 'Truffle Burger',
    price: 12.00,
  );

  late MockOrderRepository mockRepo;
  late CheckoutStore checkoutStore;
  late CartService cartService;

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    mockRepo = MockOrderRepository();
    cartService = Get.put(CartService(), permanent: true);
    checkoutStore = Get.put(CheckoutStore(orderRepository: mockRepo));
  });

  tearDown(() {
    Get.reset();
  });

  test('Initial state loads default address and cash payment', () {
    expect(checkoutStore.state.value.deliveryAddress.isNotEmpty, true);
    expect(checkoutStore.state.value.paymentMethod, 'cash');
    expect(checkoutStore.state.value.isLoading, false);
  });

  test('Changing payment method updates state', () {
    checkoutStore.onIntent(const ChangePaymentMethod('khqr'));
    expect(checkoutStore.state.value.paymentMethod, 'khqr');

    checkoutStore.onIntent(const ChangePaymentMethod('card'));
    expect(checkoutStore.state.value.paymentMethod, 'card');
  });

  test('Changing address updates state', () {
    checkoutStore.onIntent(const ChangeDeliveryAddress('No. 45, St. 310, BKK1'));
    expect(checkoutStore.state.value.deliveryAddress, 'No. 45, St. 310, BKK1');
  });

  test('Changing delivery location updates address, lat, and lng', () {
    checkoutStore.onIntent(const ChangeDeliveryLocation(
      address: 'Riverside Walkway, Phnom Penh',
      lat: 11.5690,
      lng: 104.9355,
    ));
    expect(checkoutStore.state.value.deliveryAddress, 'Riverside Walkway, Phnom Penh');
    expect(checkoutStore.state.value.deliveryLat, 11.5690);
    expect(checkoutStore.state.value.deliveryLng, 104.9355);
  });

  test('SubmitOrder places order, clears cart, and saves address & coordinates', () async {
    // Add item to cart
    cartService.addItem(burger, quantity: 2);
    expect(cartService.isEmpty, false);

    checkoutStore.onIntent(const ChangeDeliveryLocation(
      address: 'No. 45, St. 310, BKK1',
      lat: 11.5529,
      lng: 104.9282,
    ));
    checkoutStore.onIntent(const ChangeDeliveryNote('Gate 2'));
    checkoutStore.onIntent(const ChangePaymentMethod('khqr'));

    checkoutStore.onIntent(const SubmitOrder());
    await Future.delayed(const Duration(milliseconds: 50));

    // Verify order was sent to repository with correct payload
    expect(mockRepo.lastItems, isNotNull);
    expect(mockRepo.lastItems!.first['food'], 'food_burger');
    expect(mockRepo.lastItems!.first['quantity'], 2);
    expect(mockRepo.lastAddress, 'No. 45, St. 310, BKK1 (Note: Gate 2)');
    expect(mockRepo.lastPaymentMethod, 'khqr');
    expect(mockRepo.lastLat, 11.5529);
    expect(mockRepo.lastLng, 104.9282);

    // Verify cart was cleared
    expect(cartService.isEmpty, true);

    // Verify address and coordinates were persisted to LocalDB
    expect(LocalDB.getString('user_delivery_address'), 'No. 45, St. 310, BKK1');
    expect(LocalDB.getString('user_delivery_lat'), '11.5529');
    expect(LocalDB.getString('user_delivery_lng'), '104.9282');
  });

  test('SubmitOrder handles error when repository throws', () async {
    cartService.addItem(burger, quantity: 1);
    mockRepo.shouldThrow = true;

    checkoutStore.onIntent(const SubmitOrder());
    await Future.delayed(const Duration(milliseconds: 50));

    expect(checkoutStore.state.value.isLoading, false);
    expect(checkoutStore.state.value.errorMessage, 'Server connection failed');
    // Cart should NOT be cleared if order failed
    expect(cartService.isEmpty, false);
  });

  test('Voucher flow: empty code sets error, remove resets voucher', () {
    // Empty code
    checkoutStore.onIntent(const ApplyVoucherIntent('   '));
    expect(checkoutStore.state.value.voucherError, 'Please enter a voucher code');

    // Simulate applied voucher
    checkoutStore.state.value = checkoutStore.state.value.copyWith(
      appliedVoucherCode: 'WELCOME10',
      discountAmount: 2.40,
    );
    expect(checkoutStore.state.value.appliedVoucherCode, 'WELCOME10');
    expect(checkoutStore.state.value.discountAmount, 2.40);

    // Remove voucher
    checkoutStore.onIntent(const RemoveVoucherIntent());
    expect(checkoutStore.state.value.appliedVoucherCode, isNull);
    expect(checkoutStore.state.value.discountAmount, 0.0);
  });

  test('SubmitOrder includes applied voucher code in repository call', () async {
    cartService.addItem(burger, quantity: 2);
    checkoutStore.state.value = checkoutStore.state.value.copyWith(
      appliedVoucherCode: 'WELCOME10',
      discountAmount: 2.40,
    );

    checkoutStore.onIntent(const SubmitOrder());
    await Future.delayed(const Duration(milliseconds: 50));

    expect(mockRepo.lastVoucherCode, 'WELCOME10');
  });

  testWidgets('CheckoutView renders address, payment methods, voucher card, and items', (tester) async {
    cartService.addItem(burger, quantity: 2);

    await tester.pumpWidget(
      const GetMaterialApp(
        home: CheckoutView(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Checkout'), findsOneWidget);
    expect(find.text('Delivery Address'), findsOneWidget);
    expect(find.text('Payment Method'), findsOneWidget);
    expect(find.text('Cash on Delivery'), findsOneWidget);
    expect(find.text('ABA KHQR / Mobile'), findsOneWidget);
    expect(find.text('Promo Code & Vouchers'), findsOneWidget);
    expect(find.text('WELCOME10'), findsOneWidget);
    expect(find.text('FREESHIP'), findsOneWidget);
    expect(find.text('Place Order'), findsOneWidget);
  });

  testWidgets('OrderSuccessView renders confirmation details', (tester) async {
    final sampleOrder = OrderEntity(
      id: 'abcde12345',
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

    await tester.pumpWidget(
      GetMaterialApp(
        home: const SizedBox(),
        onGenerateRoute: (settings) {
          return MaterialPageRoute(
            settings: RouteSettings(arguments: sampleOrder),
            builder: (_) => const OrderSuccessView(),
          );
        },
      ),
    );

    // Navigate to OrderSuccessView with arguments
    Get.to(() => const OrderSuccessView(), arguments: sampleOrder);
    await tester.pumpAndSettle();

    expect(find.text('Order Placed! 🎉'), findsOneWidget);
    expect(find.text('Track My Order'), findsOneWidget);
    expect(find.text('Back to Explore'), findsOneWidget);
    expect(find.text('\$24.00'), findsOneWidget);
    expect(find.text('Live Delivery Status'), findsOneWidget);
    expect(find.text('Order Received & Confirmed'), findsOneWidget);
  });

  testWidgets('OrderSuccessView Track My Order navigates to AppRoutes.orderDetail with order', (tester) async {
    final sampleOrder = OrderEntity(
      id: 'abcde12345',
      userId: 'user1',
      items: const [
        OrderItemEntity(
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

    await tester.pumpWidget(
      GetMaterialApp(
        initialRoute: '/success',
        getPages: [
          GetPage(
            name: '/success',
            page: () => const OrderSuccessView(),
          ),
          GetPage(
            name: AppRoutes.orderDetail,
            page: () => const Scaffold(body: Text('OrderDetailScreen')),
          ),
        ],
      ),
    );

    Get.to(() => const OrderSuccessView(), arguments: sampleOrder);
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.text('Track My Order'));
    await tester.tap(find.text('Track My Order'));
    await tester.pumpAndSettle();

    expect(find.text('OrderDetailScreen'), findsOneWidget);
  });
}

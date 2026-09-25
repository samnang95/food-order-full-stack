import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/locale/locale_store.dart';
import 'package:food_order_app/core/theme/theme_store.dart';
import 'package:food_order_app/domain/order/entities/order_entity.dart';
import 'package:food_order_app/domain/order/repositories/order_repository.dart';
import 'package:food_order_app/features/profile/profile_intent.dart';
import 'package:food_order_app/features/profile/profile_store.dart';
import 'package:food_order_app/features/profile/profile_view.dart';

class MockOrderRepository implements OrderRepository {
  List<OrderEntity> mockOrders = [];

  @override
  Future<List<OrderEntity>> getMyOrders() async => mockOrders;

  @override
  Future<OrderEntity> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
    double? deliveryLat,
    double? deliveryLng,
  }) async => throw UnimplementedError();

  @override
  Future<OrderEntity> getOrderById(String orderId) async => throw UnimplementedError();

  @override
  Future<OrderEntity> cancelOrder(String orderId) async => throw UnimplementedError();
}

void main() {
  late MockOrderRepository mockRepo;
  late ProfileStore profileStore;

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({
      ProfileStore.keyUsername: 'TestFoodie',
      ProfileStore.keyEmail: 'test@bitecraft.com',
      ProfileStore.keyRole: 'customer',
      ProfileStore.keySavedAddresses: ['Street 271, Phnom Penh', 'Work: BKK1'],
    });
    await LocalDB.init();

    mockRepo = MockOrderRepository();
    mockRepo.mockOrders = [
      OrderEntity(
        id: 'o1',
        userId: 'u1',
        items: const [],
        totalAmount: 20.0,
        deliveryAddress: 'Street 271',
        status: 'delivered',
        paymentMethod: 'cash',
        paymentStatus: 'completed',
        createdAt: DateTime.now(),
      ),
      OrderEntity(
        id: 'o2',
        userId: 'u1',
        items: const [],
        totalAmount: 15.0,
        deliveryAddress: 'Street 271',
        status: 'pending',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        createdAt: DateTime.now(),
      ),
    ];

    Get.put(ThemeStore());
    Get.put(LocaleStore());
    profileStore = Get.put(ProfileStore(orderRepository: mockRepo));
  });

  tearDown(() {
    Get.reset();
  });

  test('ProfileStore initializes with cached data and calculates dynamic stats', () async {
    await Future.delayed(const Duration(milliseconds: 50));

    expect(profileStore.state.value.username, 'TestFoodie');
    expect(profileStore.state.value.email, 'test@bitecraft.com');
    expect(profileStore.state.value.role, 'customer');
    expect(profileStore.state.value.savedAddresses.length, 2);
    expect(profileStore.state.value.ordersCount, 2);
    expect(profileStore.state.value.points, 80); // 2 orders * 40 points
  });

  test('ProfileStore adds and removes saved addresses', () async {
    await Future.delayed(const Duration(milliseconds: 50));

    profileStore.onIntent(const AddSavedAddressIntent('Home: Street 60M'));
    await Future.delayed(const Duration(milliseconds: 50));
    expect(profileStore.state.value.savedAddresses.length, 3);
    expect(profileStore.state.value.savedAddresses.first, 'Home: Street 60M');

    profileStore.onIntent(const DeleteSavedAddressIntent(0));
    await Future.delayed(const Duration(milliseconds: 50));
    expect(profileStore.state.value.savedAddresses.length, 2);
  });

  testWidgets('ProfileView renders profile header, dynamic stats, and preferences', (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      const GetMaterialApp(
        home: ProfileView(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('My Profile'), findsOneWidget);
    expect(find.text('TestFoodie'), findsOneWidget);
    expect(find.text('test@bitecraft.com'), findsOneWidget);
    expect(find.text('CUSTOMER'), findsOneWidget);
    expect(find.text('Dark Mode'), findsOneWidget);
    expect(find.text('Language'), findsOneWidget);
    expect(find.text('Saved Addresses'), findsOneWidget);
    expect(find.text('Order History'), findsOneWidget);
    expect(find.text('Sign Out'), findsOneWidget);
    // Camera badge is rendered on avatar
    expect(find.byIcon(Icons.camera_alt_rounded), findsOneWidget);
    // Initials letter 'T' is rendered for 'TestFoodie'
    expect(find.text('T'), findsOneWidget);
  });

  test('ProfileStore initializes with cached avatar when present', () async {
    SharedPreferences.setMockInitialValues({
      ProfileStore.keyUsername: 'ChefAlex',
      ProfileStore.keyAvatar: 'https://cloudinary.com/avatar.png',
    });
    await LocalDB.init();

    final testStore = ProfileStore(orderRepository: mockRepo);
    testStore.onInit();
    await Future.delayed(const Duration(milliseconds: 50));

    expect(testStore.state.value.avatar, 'https://cloudinary.com/avatar.png');
    expect(testStore.state.value.username, 'ChefAlex');
  });
}

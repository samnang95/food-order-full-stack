import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/address_service.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/domain/address/entities/saved_address_entity.dart';
import 'package:food_order_app/domain/order/entities/order_entity.dart';
import 'package:food_order_app/domain/order/repositories/order_repository.dart';
import 'package:food_order_app/features/checkout/checkout_store.dart';
import 'package:food_order_app/features/checkout/widgets/saved_address_picker_sheet.dart';

class MockOrderRepo implements OrderRepository {
  @override
  Future<OrderEntity> placeOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String paymentMethod,
    double? deliveryLat,
    double? deliveryLng,
    String? voucherCode,
  }) async {
    throw UnimplementedError();
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
  late AddressService addressService;

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    mockRepo = MockOrderRepo();
    Get.put(CartService(), permanent: true);
    addressService = Get.put(AddressService(), permanent: true);
    checkoutStore = Get.put(CheckoutStore(orderRepository: mockRepo));
  });

  tearDown(() {
    Get.reset();
  });

  Widget buildTestWidget({bool initialAddNew = false}) {
    return GetMaterialApp(
      home: Scaffold(
        body: SavedAddressPickerSheet(
          store: checkoutStore,
          initialAddNew: initialAddNew,
        ),
      ),
    );
  }

  group('SavedAddressPickerSheet Widget Tests', () {
    testWidgets('Renders saved addresses list and Add New button', (tester) async {
      await tester.pumpWidget(buildTestWidget());
      await tester.pumpAndSettle();

      expect(find.text('Saved Addresses'), findsOneWidget);
      expect(find.text('HOME'), findsWidgets);
      expect(find.text('WORK'), findsWidgets);
      expect(find.text('Add New'), findsOneWidget);
    });

    testWidgets('Tapping Add New displays creation form', (tester) async {
      await tester.pumpWidget(buildTestWidget());
      await tester.pumpAndSettle();

      // Tap Add New button
      await tester.tap(find.text('Add New'));
      await tester.pumpAndSettle();

      // Form header and fields should be displayed
      expect(find.text('Add New Address'), findsOneWidget);
      expect(find.text('Save & Use Address'), findsOneWidget);
      expect(find.text('Set as default delivery address'), findsOneWidget);
    });

    testWidgets('Opens directly in Add New mode when initialAddNew is true', (tester) async {
      await tester.pumpWidget(buildTestWidget(initialAddNew: true));
      await tester.pumpAndSettle();

      expect(find.text('Add New Address'), findsOneWidget);
      expect(find.text('Save & Use Address'), findsOneWidget);
    });

    testWidgets('Selecting an address updates checkout state', (tester) async {
      const workAddr = SavedAddressEntity(
        id: 'addr_work',
        label: 'Work',
        address: 'Street 306, Boeung Keng Kang 1, Phnom Penh',
        lat: 11.5529,
        lng: 104.9282,
        note: 'BKK1 Tower',
      );
      addressService.saveAddress(workAddr);

      await tester.pumpWidget(buildTestWidget());
      await tester.pumpAndSettle();

      // Tap on the WORK address text
      await tester.tap(find.text('WORK').first);
      await tester.pumpAndSettle();

      expect(checkoutStore.state.value.selectedAddressId, 'addr_work');
      expect(checkoutStore.state.value.deliveryAddress, contains('Street 306'));
    });
  });
}

import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/address_service.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/domain/address/entities/saved_address_entity.dart';
import 'package:food_order_app/domain/order/entities/order_entity.dart';
import 'package:food_order_app/domain/order/repositories/order_repository.dart';
import 'package:food_order_app/features/checkout/checkout_intent.dart';
import 'package:food_order_app/features/checkout/checkout_store.dart';

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
    return OrderEntity(
      id: 'order_123',
      userId: 'user_1',
      items: const [],
      totalAmount: 10.0,
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

  group('Checkout Saved Addresses Integration Tests', () {
    test('Initializes state with saved addresses from AddressService', () {
      final state = checkoutStore.state.value;
      expect(state.savedAddresses.isNotEmpty, isTrue);
      expect(state.deliveryAddress, isNotEmpty);
      expect(state.selectedAddressId, isNotNull);
    });

    test('SelectSavedAddressIntent updates address, lat/lng, note and selectedId', () {
      const customAddr = SavedAddressEntity(
        id: 'addr_office_99',
        label: 'Office',
        address: 'Vattanac Capital Tower, Floor 18, Phnom Penh',
        lat: 11.572,
        lng: 104.918,
        note: 'Leave with front security desk',
      );
      addressService.saveAddress(customAddr);

      checkoutStore.onIntent(const SelectSavedAddressIntent('addr_office_99'));

      final state = checkoutStore.state.value;
      expect(state.selectedAddressId, 'addr_office_99');
      expect(state.deliveryAddress, 'Vattanac Capital Tower, Floor 18, Phnom Penh');
      expect(state.deliveryLat, 11.572);
      expect(state.deliveryLng, 104.918);
      expect(state.deliveryNote, 'Leave with front security desk');
    });

    test('SaveCurrentAddressIntent creates and selects a new SavedAddressEntity', () {
      checkoutStore.onIntent(const ChangeDeliveryLocation(
        address: 'Riverside Walkway, Phnom Penh',
        lat: 11.567,
        lng: 104.931,
      ));
      checkoutStore.onIntent(const ChangeDeliveryNote('Meet near fountain'));

      checkoutStore.onIntent(const SaveCurrentAddressIntent(
        label: 'Riverside Spot',
        note: 'Near fountain',
        setAsDefault: false,
      ));

      final state = checkoutStore.state.value;
      expect(state.selectedAddressId, isNotNull);
      final savedInService = addressService.addresses.firstWhere((a) => a.id == state.selectedAddressId);
      expect(savedInService.label, 'Riverside Spot');
      expect(savedInService.address, 'Riverside Walkway, Phnom Penh');
      expect(savedInService.lat, 11.567);
      expect(savedInService.lng, 104.931);
      expect(savedInService.note, 'Near fountain');
    });

    test('DeleteSavedAddressIntent removes address from AddressService and state', () {
      const tempAddr = SavedAddressEntity(
        id: 'addr_temp_del',
        label: 'Temp',
        address: 'Street 100, Phnom Penh',
        lat: 11.55,
        lng: 104.90,
      );
      addressService.saveAddress(tempAddr);
      expect(checkoutStore.state.value.savedAddresses.any((a) => a.id == 'addr_temp_del'), isTrue);

      checkoutStore.onIntent(const DeleteSavedAddressIntent('addr_temp_del'));

      expect(addressService.addresses.any((a) => a.id == 'addr_temp_del'), isFalse);
      expect(checkoutStore.state.value.savedAddresses.any((a) => a.id == 'addr_temp_del'), isFalse);
    });
  });
}

import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/address_service.dart';
import 'package:food_order_app/domain/address/entities/saved_address_entity.dart';

void main() {
  late AddressService addressService;

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    addressService = Get.put(AddressService(), permanent: true);
  });

  tearDown(() {
    Get.reset();
  });

  group('AddressService Tests', () {
    test('Initializes with default seed addresses when local storage is empty', () {
      expect(addressService.addresses.isNotEmpty, isTrue);
      expect(addressService.addresses.length, greaterThanOrEqualTo(2));
      expect(addressService.addresses.any((a) => a.label == 'Home'), isTrue);
      expect(addressService.addresses.any((a) => a.label == 'Work'), isTrue);
      expect(addressService.selectedAddress.value, isNotNull);
      expect(addressService.selectedAddress.value!.isDefault, isTrue);
    });

    test('saveAddress adds new address and updates LocalDB', () {
      final initialCount = addressService.addresses.length;
      const newAddr = SavedAddressEntity(
        id: 'addr_test_123',
        label: 'Gym',
        address: 'BKK1, Street 57, Phnom Penh',
        lat: 11.552,
        lng: 104.925,
        note: 'Ring buzzer #4',
        isDefault: false,
      );

      addressService.saveAddress(newAddr);

      expect(addressService.addresses.length, initialCount + 1);
      final found = addressService.addresses.firstWhere((a) => a.id == 'addr_test_123');
      expect(found.label, 'Gym');
      expect(found.address, 'BKK1, Street 57, Phnom Penh');
      expect(found.note, 'Ring buzzer #4');
    });

    test('saveAddress updates existing address if id matches', () {
      final initialCount = addressService.addresses.length;
      final existing = addressService.addresses.first;

      final updated = existing.copyWith(
        address: 'Updated Street 999, Phnom Penh',
        note: 'Leave at front door',
      );

      addressService.saveAddress(updated);

      expect(addressService.addresses.length, initialCount);
      final found = addressService.addresses.firstWhere((a) => a.id == existing.id);
      expect(found.address, 'Updated Street 999, Phnom Penh');
      expect(found.note, 'Leave at front door');
    });

    test('Saving address with isDefault=true updates other addresses to not default', () {
      const defaultAddr = SavedAddressEntity(
        id: 'addr_new_default',
        label: 'Partner',
        address: 'TTP, Street 432, Phnom Penh',
        lat: 11.535,
        lng: 104.912,
        isDefault: true,
      );

      addressService.saveAddress(defaultAddr);

      final newDefault = addressService.addresses.firstWhere((a) => a.id == 'addr_new_default');
      expect(newDefault.isDefault, isTrue);

      final otherDefaults = addressService.addresses.where((a) => a.id != 'addr_new_default' && a.isDefault);
      expect(otherDefaults.isEmpty, isTrue);
      expect(addressService.selectedAddress.value?.id, 'addr_new_default');
    });

    test('selectAddress updates selectedAddress reactive state', () {
      final target = addressService.addresses.last;
      addressService.selectAddress(target);

      expect(addressService.selectedAddress.value?.id, target.id);
    });

    test('setDefaultAddress sets default flag and selects address', () {
      final target = addressService.addresses.last;
      addressService.setDefaultAddress(target.id);

      final found = addressService.addresses.firstWhere((a) => a.id == target.id);
      expect(found.isDefault, isTrue);
      expect(addressService.selectedAddress.value?.id, target.id);

      final otherDefaults = addressService.addresses.where((a) => a.id != target.id && a.isDefault);
      expect(otherDefaults.isEmpty, isTrue);
    });

    test('deleteAddress removes item and updates selection', () {
      final initialCount = addressService.addresses.length;
      final toDelete = addressService.addresses.first;
      addressService.selectAddress(toDelete);

      addressService.deleteAddress(toDelete.id);

      expect(addressService.addresses.length, initialCount - 1);
      expect(addressService.addresses.any((a) => a.id == toDelete.id), isFalse);
      expect(addressService.selectedAddress.value?.id, isNot(toDelete.id));
    });
  });
}

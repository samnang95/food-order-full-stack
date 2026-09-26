import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../db/local_db.dart';
import '../../domain/address/entities/saved_address_entity.dart';

class AddressService extends GetxService {
  static const String _keySavedAddresses = 'user_saved_addresses_data';

  final RxList<SavedAddressEntity> addresses = <SavedAddressEntity>[].obs;
  final Rx<SavedAddressEntity?> selectedAddress = Rx<SavedAddressEntity?>(null);

  static const List<SavedAddressEntity> _defaultSeedAddresses = [
    SavedAddressEntity(
      id: 'addr_home',
      label: 'Home',
      address: 'Street 271, Boeng Tumpun, Phnom Penh',
      lat: 11.5385,
      lng: 104.9080,
      note: 'Gate 2, Ring bell on arrival',
      isDefault: true,
    ),
    SavedAddressEntity(
      id: 'addr_work',
      label: 'Work',
      address: 'Street 306, Boeung Keng Kang 1, Phnom Penh',
      lat: 11.5529,
      lng: 104.9282,
      note: 'BKK1 Tower, 3rd Floor Reception',
      isDefault: false,
    ),
  ];

  @override
  void onInit() {
    super.onInit();
    _loadAddresses();
  }

  void _loadAddresses() {
    try {
      final jsonStr = LocalDB.getString(_keySavedAddresses);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final List<dynamic> list = jsonDecode(jsonStr);
        final loaded = list
            .map((e) => SavedAddressEntity.fromJson(e as Map<String, dynamic>))
            .toList();
        if (loaded.isNotEmpty) {
          addresses.assignAll(loaded);
          _selectDefaultOrFirst();
          return;
        }
      }
    } catch (e) {
      debugPrint('⚠️ [AddressService] Error loading addresses from LocalDB: $e');
    }

    // Fallback seed
    addresses.assignAll(_defaultSeedAddresses);
    _persist();
    _selectDefaultOrFirst();
  }

  void _selectDefaultOrFirst() {
    final def = addresses.firstWhereOrNull((a) => a.isDefault) ??
        (addresses.isNotEmpty ? addresses.first : null);
    selectedAddress.value = def;
  }

  void _persist() {
    try {
      final encoded = jsonEncode(addresses.map((a) => a.toJson()).toList());
      LocalDB.setString(_keySavedAddresses, encoded);
    } catch (e) {
      debugPrint('⚠️ [AddressService] Error persisting addresses: $e');
    }
  }

  void selectAddress(SavedAddressEntity address) {
    selectedAddress.value = address;
  }

  void saveAddress(SavedAddressEntity address) {
    final index = addresses.indexWhere((a) => a.id == address.id);
    if (index >= 0) {
      addresses[index] = address;
    } else {
      addresses.add(address);
    }

    if (address.isDefault) {
      _applyDefaultExclusivity(address.id);
    }

    _persist();
    selectedAddress.value = address;
  }

  void deleteAddress(String id) {
    addresses.removeWhere((a) => a.id == id);
    if (selectedAddress.value?.id == id) {
      _selectDefaultOrFirst();
    }
    _persist();
  }

  void setDefault(String id) {
    _applyDefaultExclusivity(id);
    _persist();
  }

  void setDefaultAddress(String id) => setDefault(id);

  void _applyDefaultExclusivity(String defaultId) {
    addresses.assignAll(addresses.map((a) {
      return a.copyWith(isDefault: a.id == defaultId);
    }).toList());

    final updated = addresses.firstWhereOrNull((a) => a.id == defaultId);
    if (updated != null) {
      selectedAddress.value = updated;
    }
  }
}

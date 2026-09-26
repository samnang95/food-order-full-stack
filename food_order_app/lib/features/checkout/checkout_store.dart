import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/db/local_db.dart';
import '../../core/services/address_service.dart';
import '../../core/services/api_client.dart';
import '../../core/services/cart_service.dart';
import '../../core/services/voucher_service.dart';
import '../../domain/address/entities/saved_address_entity.dart';
import '../../domain/order/repositories/order_repository.dart';
import '../../routes/app_routes.dart';
import '../notifications/models/notification_item_model.dart';
import '../notifications/notification_store.dart';
import '../orders/orders_intent.dart';
import '../orders/orders_store.dart';
import 'checkout_intent.dart';
import 'checkout_state.dart';

class CheckoutStore extends GetxController {
  final OrderRepository orderRepository;

  CheckoutStore({required this.orderRepository});

  static const String _addressKey = 'user_delivery_address';
  static const String _latKey = 'user_delivery_lat';
  static const String _lngKey = 'user_delivery_lng';

  final Rx<CheckoutState> state = const CheckoutState().obs;

  AddressService get addressService {
    if (Get.isRegistered<AddressService>()) {
      return Get.find<AddressService>();
    }
    return Get.put(AddressService(), permanent: true);
  }

  CartService get cartService {
    if (Get.isRegistered<CartService>()) {
      return Get.find<CartService>();
    }
    return Get.put(CartService(), permanent: true);
  }

  VoucherService get voucherService {
    if (Get.isRegistered<VoucherService>()) {
      return Get.find<VoucherService>();
    }
    return Get.put(VoucherService(), permanent: true);
  }

  double get deliveryFee => 1.50;

  double get finalTotal {
    final subtotal = cartService.subtotal;
    final discount = state.value.discountAmount;
    final total = (subtotal - discount + deliveryFee).clamp(0.0, double.infinity);
    return double.parse(total.toStringAsFixed(2));
  }

  @override
  void onInit() {
    super.onInit();
    _loadSavedAddress();
    _syncWithAddressService();
    _fetchAvailableVouchers();
    _syncWithVoucherService();
  }

  void _syncWithAddressService() {
    state.value = state.value.copyWith(
      savedAddresses: addressService.addresses.toList(),
    );

    if (addressService.selectedAddress.value != null) {
      final selected = addressService.selectedAddress.value!;
      state.value = state.value.copyWith(
        deliveryAddress: selected.address,
        deliveryLat: selected.lat,
        deliveryLng: selected.lng,
        deliveryNote: selected.note,
        selectedAddressId: selected.id,
      );
    }

    ever(addressService.addresses, (List<SavedAddressEntity> list) {
      state.value = state.value.copyWith(savedAddresses: list.toList());
    });

    ever(addressService.selectedAddress, (SavedAddressEntity? selected) {
      if (selected != null) {
        state.value = state.value.copyWith(
          deliveryAddress: selected.address,
          deliveryLat: selected.lat,
          deliveryLng: selected.lng,
          deliveryNote: selected.note,
          selectedAddressId: selected.id,
        );
      }
    });
  }

  void _syncWithVoucherService() {
    // If a voucher is already applied in Cart, carry it over to Checkout
    if (voucherService.appliedVoucher.value != null) {
      state.value = state.value.copyWith(
        appliedVoucherCode: voucherService.appliedVoucher.value!.code,
        discountAmount: voucherService.discountAmount.value,
        voucherSuccessMessage: voucherService.voucherSuccessMessage.value,
      );
    }

    ever(voucherService.appliedVoucher, (v) {
      if (v == null) {
        state.value = state.value.copyWith(clearVoucher: true);
      } else {
        state.value = state.value.copyWith(
          appliedVoucherCode: v.code,
          discountAmount: voucherService.discountAmount.value,
          voucherSuccessMessage: voucherService.voucherSuccessMessage.value,
        );
      }
    });

    ever(voucherService.discountAmount, (d) {
      state.value = state.value.copyWith(discountAmount: d);
    });
  }

  void _loadSavedAddress() {
    final savedAddr = LocalDB.getString(_addressKey);
    final savedLatStr = LocalDB.getString(_latKey);
    final savedLngStr = LocalDB.getString(_lngKey);

    double? lat;
    double? lng;
    if (savedLatStr != null) lat = double.tryParse(savedLatStr);
    if (savedLngStr != null) lng = double.tryParse(savedLngStr);

    if (savedAddr != null && savedAddr.trim().isNotEmpty) {
      state.value = state.value.copyWith(
        deliveryAddress: savedAddr.trim(),
        deliveryLat: lat,
        deliveryLng: lng,
      );
    } else if (lat != null && lng != null) {
      state.value = state.value.copyWith(
        deliveryLat: lat,
        deliveryLng: lng,
      );
    }
  }

  Future<void> _fetchAvailableVouchers() async {
    try {
      final res = await ApiClient.get('/vouchers');
      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);
        if (json['data'] is List) {
          final list = (json['data'] as List)
              .whereType<Map<String, dynamic>>()
              .toList();
          state.value = state.value.copyWith(availableVouchers: list);
        }
      }
    } catch (e) {
      debugPrint('⚠️ [CheckoutStore] Failed to fetch vouchers: $e');
    }
  }

  void onIntent(CheckoutIntent intent) {
    switch (intent) {
      case ChangeDeliveryAddress(:final address):
        state.value = state.value.copyWith(deliveryAddress: address);
      case ChangeDeliveryLocation(:final address, :final lat, :final lng):
        state.value = state.value.copyWith(
          deliveryAddress: address,
          deliveryLat: lat,
          deliveryLng: lng,
        );
      case ChangeDeliveryNote(:final note):
        state.value = state.value.copyWith(deliveryNote: note);
      case ChangePaymentMethod(:final method):
        state.value = state.value.copyWith(paymentMethod: method);
      case ApplyVoucherIntent(:final code):
        _onApplyVoucher(code);
      case RemoveVoucherIntent():
        _onRemoveVoucher();
      case SubmitOrder():
        _onSubmitOrder();
      case SelectSavedAddressIntent(:final addressId):
        _onSelectSavedAddress(addressId);
      case SaveCurrentAddressIntent(:final label, :final note, :final setAsDefault):
        _onSaveCurrentAddress(label, note, setAsDefault);
      case DeleteSavedAddressIntent(:final addressId):
        addressService.deleteAddress(addressId);
      case ToggleCutleryIntent(:final requestCutlery):
        state.value = state.value.copyWith(requestCutlery: requestCutlery);
      case UpdateCutleryCountIntent(:final count):
        state.value = state.value.copyWith(cutleryCount: count.clamp(1, 10));
      case ChangeKitchenNoteIntent(:final note):
        state.value = state.value.copyWith(kitchenNote: note);
      case ToggleKitchenPreferenceIntent(:final preference):
        final current = List<String>.from(state.value.kitchenPreferences);
        if (current.contains(preference)) {
          current.remove(preference);
        } else {
          current.add(preference);
        }
        state.value = state.value.copyWith(kitchenPreferences: current);
      case ToggleCondimentIntent(:final condiment):
        final current = List<String>.from(state.value.selectedCondiments);
        if (current.contains(condiment)) {
          current.remove(condiment);
        } else {
          current.add(condiment);
        }
        state.value = state.value.copyWith(selectedCondiments: current);
    }
  }

  void _onSelectSavedAddress(String addressId) {
    final addr = addressService.addresses.firstWhereOrNull((a) => a.id == addressId);
    if (addr != null) {
      addressService.selectAddress(addr);
      state.value = state.value.copyWith(
        deliveryAddress: addr.address,
        deliveryLat: addr.lat,
        deliveryLng: addr.lng,
        deliveryNote: addr.note,
        selectedAddressId: addr.id,
      );
    }
  }

  void _onSaveCurrentAddress(String label, String? note, bool setAsDefault) {
    final newAddr = SavedAddressEntity(
      id: 'addr_${DateTime.now().millisecondsSinceEpoch}',
      label: label,
      address: state.value.deliveryAddress,
      lat: state.value.deliveryLat,
      lng: state.value.deliveryLng,
      note: note ?? state.value.deliveryNote,
      isDefault: setAsDefault,
    );
    addressService.saveAddress(newAddr);
    state.value = state.value.copyWith(
      selectedAddressId: newAddr.id,
    );
  }

  Future<void> _onApplyVoucher(String code) async {
    final cleanCode = code.trim();
    if (cleanCode.isEmpty) {
      state.value = state.value.copyWith(voucherError: 'Please enter a voucher code');
      return;
    }

    state.value = state.value.copyWith(isApplyingVoucher: true, voucherError: null);

    try {
      final res = await voucherService.applyVoucher(cleanCode, cartService.subtotal);
      if (!res.valid) {
        state.value = state.value.copyWith(
          isApplyingVoucher: false,
          voucherError: res.message,
        );
      } else {
        state.value = state.value.copyWith(
          isApplyingVoucher: false,
          appliedVoucherCode: res.code,
          discountAmount: res.discountAmount,
          voucherSuccessMessage: res.message,
          voucherError: null,
        );
      }
    } catch (e) {
      state.value = state.value.copyWith(
        isApplyingVoucher: false,
        voucherError: 'Failed to validate voucher. Please try again.',
      );
    }
  }

  void _onRemoveVoucher() {
    voucherService.removeVoucher();
    state.value = state.value.copyWith(clearVoucher: true);
  }

  Future<void> _onSubmitOrder() async {
    if (cartService.isEmpty) {
      if (Get.context != null) {
        Get.snackbar(
          'Cart is Empty',
          'Please add some items to your cart before checking out.',
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 12,
        );
      }
      return;
    }

    final address = state.value.deliveryAddress.trim();
    if (address.isEmpty) {
      if (Get.context != null) {
        Get.snackbar(
          'Missing Address',
          'Please enter a delivery address.',
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 12,
        );
      }
      return;
    }

    state.value = state.value.copyWith(isLoading: true, errorMessage: null);

    try {
      final itemsPayload = cartService.items.map((item) {
        return {
          'food': item.food.id,
          'quantity': item.quantity,
        };
      }).toList();

      final notes = <String>[];
      if (state.value.deliveryNote.trim().isNotEmpty) {
        notes.add(state.value.deliveryNote.trim());
      }
      if (state.value.requestCutlery) {
        final count = state.value.cutleryCount;
        notes.add('Cutlery: $count set${count > 1 ? "s" : ""}');
      }
      if (state.value.kitchenPreferences.isNotEmpty) {
        notes.add('Prep: ${state.value.kitchenPreferences.join(", ")}');
      }
      if (state.value.kitchenNote.trim().isNotEmpty) {
        notes.add('Kitchen: ${state.value.kitchenNote.trim()}');
      }
      if (state.value.selectedCondiments.isNotEmpty) {
        notes.add('Extras: ${state.value.selectedCondiments.join(", ")}');
      }

      final fullAddress = notes.isNotEmpty
          ? '$address (Note: ${notes.join(" • ")})'
          : address;

      final order = await orderRepository.placeOrder(
        items: itemsPayload,
        deliveryAddress: fullAddress,
        paymentMethod: state.value.paymentMethod,
        deliveryLat: state.value.deliveryLat,
        deliveryLng: state.value.deliveryLng,
        voucherCode: voucherService.appliedVoucher.value?.code ?? state.value.appliedVoucherCode,
      );

      // Save delivery address and coordinates for future orders
      await LocalDB.setString(_addressKey, address);
      await LocalDB.setString(_latKey, state.value.deliveryLat.toString());
      await LocalDB.setString(_lngKey, state.value.deliveryLng.toString());

      // Clear cart & voucher
      voucherService.removeVoucher();
      cartService.clearCart();

      // Dispatch order confirmed in-app push notification
      if (Get.isRegistered<NotificationStore>()) {
        final shortId = order.id.length > 6
            ? order.id.substring(order.id.length - 6).toUpperCase()
            : order.id;
        Get.find<NotificationStore>().addNotification(
          NotificationItemModel(
            id: 'order_${order.id}',
            type: 'order',
            title: '📦 Order Confirmed!',
            body: 'Your order #$shortId has been placed and is being prepared.',
            orderId: order.id,
            timestamp: DateTime.now(),
            isRead: false,
          ),
          showBanner: true,
        );
      }

      // Refresh OrdersStore so the newly placed order is immediately loaded
      if (Get.isRegistered<OrdersStore>()) {
        Get.find<OrdersStore>().onIntent(const FetchOrdersIntent());
      }

      state.value = state.value.copyWith(isLoading: false);

      // Navigate to Order Success View
      Get.offNamed(AppRoutes.orderSuccess, arguments: order);
    } catch (e) {
      final cleanMsg = e.toString().replaceFirst('Exception: ', '');
      state.value = state.value.copyWith(isLoading: false, errorMessage: cleanMsg);

      if (Get.context != null) {
        Get.snackbar(
          'Order Placement Failed',
          cleanMsg,
          backgroundColor: const Color(0xFFEF4444),
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 12,
        );
      }
    }
  }
}

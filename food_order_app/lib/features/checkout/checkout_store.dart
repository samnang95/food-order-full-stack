import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/db/local_db.dart';
import '../../core/services/api_client.dart';
import '../../core/services/cart_service.dart';
import '../../domain/order/repositories/order_repository.dart';
import '../../routes/app_routes.dart';
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

  CartService get cartService {
    if (Get.isRegistered<CartService>()) {
      return Get.find<CartService>();
    }
    return Get.put(CartService(), permanent: true);
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
    _fetchAvailableVouchers();
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
    }
  }

  Future<void> _onApplyVoucher(String code) async {
    final cleanCode = code.trim();
    if (cleanCode.isEmpty) {
      state.value = state.value.copyWith(voucherError: 'Please enter a voucher code');
      return;
    }

    state.value = state.value.copyWith(isApplyingVoucher: true, voucherError: null);

    try {
      final res = await ApiClient.post('/vouchers/validate', {
        'code': cleanCode,
        'subtotal': cartService.subtotal,
      });

      final json = jsonDecode(res.body);
      if (res.statusCode == 200 && json['status'] == 'success') {
        final data = json['data'] as Map<String, dynamic>;
        final discount = (data['discountAmount'] as num?)?.toDouble() ?? 0.0;
        final appliedCode = data['code'] as String? ?? cleanCode.toUpperCase();
        final message = data['message'] as String? ?? 'Voucher applied!';

        state.value = state.value.copyWith(
          isApplyingVoucher: false,
          appliedVoucherCode: appliedCode,
          discountAmount: discount,
          voucherSuccessMessage: message,
          voucherError: null,
        );

        if (Get.context != null) {
          Get.snackbar(
            '🎉 Promo Applied!',
            message,
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.TOP,
            margin: const EdgeInsets.all(16),
            borderRadius: 12,
            duration: const Duration(seconds: 3),
          );
        }
      } else {
        final errMsg = json['message'] as String? ?? 'Invalid voucher code';
        state.value = state.value.copyWith(
          isApplyingVoucher: false,
          voucherError: errMsg,
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

      final fullAddress = state.value.deliveryNote.trim().isNotEmpty
          ? '$address (Note: ${state.value.deliveryNote.trim()})'
          : address;

      final order = await orderRepository.placeOrder(
        items: itemsPayload,
        deliveryAddress: fullAddress,
        paymentMethod: state.value.paymentMethod,
        deliveryLat: state.value.deliveryLat,
        deliveryLng: state.value.deliveryLng,
        voucherCode: state.value.appliedVoucherCode,
      );

      // Save delivery address and coordinates for future orders
      await LocalDB.setString(_addressKey, address);
      await LocalDB.setString(_latKey, state.value.deliveryLat.toString());
      await LocalDB.setString(_lngKey, state.value.deliveryLng.toString());

      // Clear cart
      cartService.clearCart();

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

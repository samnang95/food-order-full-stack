import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../domain/voucher/entities/voucher_entity.dart';
import '../../domain/voucher/entities/voucher_validation_result.dart';
import 'api_client.dart';

class VoucherService extends GetxService {
  final RxList<VoucherEntity> availableVouchers = <VoucherEntity>[].obs;
  final Rxn<VoucherEntity> appliedVoucher = Rxn<VoucherEntity>();
  final RxDouble discountAmount = 0.0.obs;
  final RxBool isLoading = false.obs;
  final RxnString voucherError = RxnString();
  final RxnString voucherSuccessMessage = RxnString();

  static const List<VoucherEntity> defaultSeedVouchers = [
    VoucherEntity(
      code: 'WELCOME10',
      title: '10% OFF',
      desc: '10% off your entire meal order',
      type: 'percentage',
      value: 10,
      minSpend: 5.0,
      maxDiscount: 5.0,
    ),
    VoucherEntity(
      code: 'FREESHIP',
      title: 'FREE DELIVERY',
      desc: '\$1.50 discount on delivery fee',
      type: 'fixed',
      value: 1.50,
      minSpend: 8.0,
      maxDiscount: 1.50,
    ),
    VoucherEntity(
      code: 'BITECRAFT2',
      title: '\$2.00 OFF',
      desc: 'Flat \$2 off orders over \$10',
      type: 'fixed',
      value: 2.00,
      minSpend: 10.0,
      maxDiscount: 2.00,
    ),
    VoucherEntity(
      code: 'KHNEWYEAR',
      title: '15% OFF SPECIAL',
      desc: '15% celebration discount up to \$6',
      type: 'percentage',
      value: 15,
      minSpend: 12.0,
      maxDiscount: 6.0,
    ),
  ];

  @override
  void onInit() {
    super.onInit();
    availableVouchers.assignAll(defaultSeedVouchers);
    fetchAvailableVouchers();
  }

  bool get hasAppliedVoucher =>
      appliedVoucher.value != null && discountAmount.value > 0;

  String? get appliedCode => appliedVoucher.value?.code;

  Future<void> fetchAvailableVouchers() async {
    try {
      final res = await ApiClient.get('/vouchers');
      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);
        if (json['data'] is List) {
          final list = (json['data'] as List)
              .map((item) => VoucherEntity.fromJson(item as Map<String, dynamic>))
              .toList();
          if (list.isNotEmpty) {
            availableVouchers.assignAll(list);
            debugPrint('🎟️ [VoucherService] Loaded ${list.length} vouchers from API');
            return;
          }
        }
      }
    } catch (e) {
      debugPrint('⚠️ [VoucherService] Failed to load vouchers from API: $e');
    }

    if (availableVouchers.isEmpty) {
      availableVouchers.assignAll(defaultSeedVouchers);
    }
  }

  Future<VoucherValidationResult> applyVoucher(String rawCode, double subtotal) async {
    final cleanCode = rawCode.trim().toUpperCase();
    if (cleanCode.isEmpty) {
      voucherError.value = 'Please enter a voucher code';
      return const VoucherValidationResult(
        valid: false,
        code: '',
        message: 'Please enter a voucher code',
      );
    }

    isLoading.value = true;
    voucherError.value = null;

    try {
      final res = await ApiClient.post('/vouchers/validate', {
        'code': cleanCode,
        'subtotal': subtotal,
      });

      final json = jsonDecode(res.body);
      if (res.statusCode == 200 && json['status'] == 'success') {
        final result = VoucherValidationResult.fromJson(json);
        _setApplied(result, subtotal);
        return result;
      } else {
        final errMsg = json['message'] as String? ?? 'Invalid voucher code';
        final minSpend = (json['minSpend'] as num?)?.toDouble();
        voucherError.value = errMsg;
        return VoucherValidationResult(
          valid: false,
          code: cleanCode,
          message: errMsg,
          minSpend: minSpend,
        );
      }
    } catch (e) {
      debugPrint('⚠️ [VoucherService] API validation failed, falling back to local: $e');
      return _localValidate(cleanCode, subtotal);
    } finally {
      isLoading.value = false;
    }
  }

  VoucherValidationResult _localValidate(String code, double subtotal) {
    final match = availableVouchers.firstWhereOrNull(
      (v) => v.code.toUpperCase() == code.toUpperCase(),
    );

    if (match == null) {
      final msg = 'Voucher "$code" is invalid or expired';
      voucherError.value = msg;
      return VoucherValidationResult(valid: false, code: code, message: msg);
    }

    if (!match.isEligible(subtotal)) {
      final msg =
          'Minimum order of \$${match.minSpend.toStringAsFixed(2)} required for this voucher (current: \$${subtotal.toStringAsFixed(2)})';
      voucherError.value = msg;
      return VoucherValidationResult(
        valid: false,
        code: code,
        minSpend: match.minSpend,
        message: msg,
      );
    }

    final discount = match.calculateDiscount(subtotal);
    final result = VoucherValidationResult(
      valid: true,
      code: match.code,
      title: match.title,
      discountType: match.type,
      discountAmount: discount,
      finalSubtotal: (subtotal - discount).clamp(0.0, double.infinity),
      message: 'Voucher "${match.code}" applied! You saved \$${discount.toStringAsFixed(2)}',
    );

    _setApplied(result, subtotal, entity: match);
    return result;
  }

  void _setApplied(VoucherValidationResult result, double subtotal, {VoucherEntity? entity}) {
    final match = entity ??
        availableVouchers.firstWhereOrNull((v) => v.code == result.code) ??
        VoucherEntity(
          code: result.code,
          title: result.title,
          desc: result.message,
          type: result.discountType,
          value: result.discountAmount,
          minSpend: 0.0,
        );

    appliedVoucher.value = match;
    discountAmount.value = result.discountAmount;
    voucherSuccessMessage.value = result.message;
    voucherError.value = null;

    if (Get.context != null && Get.overlayContext != null) {
      Get.snackbar(
        '🎉 Promo Applied!',
        result.message,
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP,
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
        duration: const Duration(seconds: 3),
        icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
      );
    }
  }

  void removeVoucher() {
    appliedVoucher.value = null;
    discountAmount.value = 0.0;
    voucherError.value = null;
    voucherSuccessMessage.value = null;
  }

  void recalculateDiscount(double subtotal) {
    final current = appliedVoucher.value;
    if (current == null) return;

    if (subtotal <= 0) {
      removeVoucher();
      return;
    }

    if (!current.isEligible(subtotal)) {
      final needed = current.amountNeeded(subtotal);
      removeVoucher();
      if (Get.context != null && Get.overlayContext != null) {
        Get.snackbar(
          'Voucher Removed',
          'Add \$${needed.toStringAsFixed(2)} more to re-apply "${current.code}"',
          backgroundColor: const Color(0xFFF59E0B),
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 12,
          duration: const Duration(seconds: 3),
          icon: const Icon(Icons.info_outline_rounded, color: Colors.white),
        );
      }
    } else {
      discountAmount.value = current.calculateDiscount(subtotal);
    }
  }
}

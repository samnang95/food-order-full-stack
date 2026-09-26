import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../domain/voucher/entities/voucher_entity.dart';
import '../services/voucher_service.dart';

class VoucherBottomSheetController extends GetxController {
  final RxDouble subtotal = 0.0.obs;
  late final TextEditingController codeController;
  final VoucherService voucherService;

  VoucherBottomSheetController({
    double initialSubtotal = 0.0,
    VoucherService? voucherService,
    TextEditingController? externalController,
  })  : voucherService = voucherService ??
            (Get.isRegistered<VoucherService>()
                ? Get.find<VoucherService>()
                : Get.put(VoucherService(), permanent: true)) {
    subtotal.value = initialSubtotal;
    codeController = externalController ?? TextEditingController();
  }

  @override
  void onInit() {
    super.onInit();
    voucherService.fetchAvailableVouchers();
  }

  void updateSubtotal(double value) {
    subtotal.value = value;
  }

  // --- Reactive Getters ---
  RxList<VoucherEntity> get availableVouchers => voucherService.availableVouchers;
  Rxn<VoucherEntity> get appliedVoucher => voucherService.appliedVoucher;
  RxBool get isLoading => voucherService.isLoading;
  RxnString get voucherError => voucherService.voucherError;

  // --- Actions ---
  Future<bool> applyCode([String? manualCode]) async {
    final code = (manualCode ?? codeController.text).trim();
    if (code.isEmpty) return false;

    final result = await voucherService.applyVoucher(code, subtotal.value);
    if (result.valid) {
      codeController.clear();
      return true;
    }
    return false;
  }

  void removeVoucher() {
    voucherService.removeVoucher();
  }

  void clearInput() {
    codeController.clear();
  }

  @override
  void onClose() {
    codeController.dispose();
    super.onClose();
  }
}

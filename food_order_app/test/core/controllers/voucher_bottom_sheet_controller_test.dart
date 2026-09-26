import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/controllers/voucher_bottom_sheet_controller.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/voucher_service.dart';

void main() {
  late VoucherService voucherService;
  late VoucherBottomSheetController controller;

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    voucherService = Get.put(VoucherService(), permanent: true);
    controller = VoucherBottomSheetController(
      initialSubtotal: 25.0,
      voucherService: voucherService,
    );
  });

  tearDown(() {
    controller.onClose();
    Get.reset();
  });

  group('VoucherBottomSheetController Tests', () {
    test('Initializes correctly with subtotal and empty controller', () {
      expect(controller.subtotal.value, 25.0);
      expect(controller.codeController.text, '');
      expect(controller.availableVouchers.isNotEmpty, true);
    });

    test('Updates subtotal reactively', () {
      controller.updateSubtotal(40.0);
      expect(controller.subtotal.value, 40.0);
    });

    test('Applies valid code from text controller and clears input on success', () async {
      controller.codeController.text = 'WELCOME10';
      final success = await controller.applyCode();

      expect(success, true);
      expect(controller.appliedVoucher.value?.code, 'WELCOME10');
      expect(controller.codeController.text, '');
    });

    test('Applies code directly via manual argument', () async {
      final success = await controller.applyCode('BITECRAFT2');

      expect(success, true);
      expect(controller.appliedVoucher.value?.code, 'BITECRAFT2');
    });

    test('Fails to apply invalid code and leaves state intact', () async {
      controller.codeController.text = 'INVALIDCODE';
      final success = await controller.applyCode();

      expect(success, false);
      expect(controller.appliedVoucher.value, isNull);
    });

    test('Fails to apply code when subtotal is below minimum spend', () async {
      controller.updateSubtotal(3.0); // WELCOME10 requires $5 min spend
      controller.codeController.text = 'WELCOME10';
      final success = await controller.applyCode();

      expect(success, false);
      expect(controller.appliedVoucher.value, isNull);
    });

    test('Removes applied voucher correctly', () async {
      await controller.applyCode('WELCOME10');
      expect(controller.appliedVoucher.value?.code, 'WELCOME10');

      controller.removeVoucher();
      expect(controller.appliedVoucher.value, isNull);
    });

    test('clearInput clears text controller', () {
      controller.codeController.text = 'SOMECODE';
      controller.clearInput();
      expect(controller.codeController.text, '');
    });
  });
}

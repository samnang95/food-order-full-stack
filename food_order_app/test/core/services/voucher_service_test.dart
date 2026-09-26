import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/core/services/voucher_service.dart';
import 'package:food_order_app/domain/food/entities/food_entity.dart';
import 'package:food_order_app/domain/voucher/entities/voucher_entity.dart';

void main() {
  late VoucherService voucherService;
  late CartService cartService;

  const testFood1 = FoodEntity(
    id: 'food_1',
    name: 'Burger Deluxe',
    categoryId: 'cat_burgers',
    categoryName: 'Burgers',
    price: 10.00,
    imageUrl: '',
  );

  const testFood2 = FoodEntity(
    id: 'food_2',
    name: 'French Fries',
    categoryId: 'cat_sides',
    categoryName: 'Sides',
    price: 4.00,
    imageUrl: '',
  );

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    voucherService = Get.put(VoucherService(), permanent: true);
    cartService = Get.put(CartService(), permanent: true);
  });

  tearDown(() {
    Get.reset();
  });

  group('VoucherEntity Tests', () {
    test('Calculates percentage discount accurately', () {
      const voucher = VoucherEntity(
        code: 'TEST10',
        title: '10% OFF',
        desc: '10% off',
        type: 'percentage',
        value: 10,
        minSpend: 5.0,
        maxDiscount: 5.0,
      );

      expect(voucher.isEligible(4.0), false);
      expect(voucher.isEligible(5.0), true);
      expect(voucher.isEligible(20.0), true);

      expect(voucher.calculateDiscount(4.0), 0.0);
      expect(voucher.calculateDiscount(20.0), 2.0);
      expect(voucher.calculateDiscount(60.0), 5.0); // capped by maxDiscount
    });

    test('Calculates fixed discount accurately', () {
      const voucher = VoucherEntity(
        code: 'FIXED2',
        title: '\$2 OFF',
        desc: 'Flat \$2 off',
        type: 'fixed',
        value: 2.00,
        minSpend: 10.0,
      );

      expect(voucher.isEligible(9.99), false);
      expect(voucher.isEligible(10.0), true);
      expect(voucher.calculateDiscount(15.0), 2.00);
    });
  });

  group('VoucherService Tests', () {
    test('Initializes with default seed vouchers', () {
      expect(voucherService.availableVouchers.isNotEmpty, true);
      expect(
        voucherService.availableVouchers.any((v) => v.code == 'WELCOME10'),
        true,
      );
    });

    test('Applies valid voucher and updates reactive state', () async {
      final res = await voucherService.applyVoucher('WELCOME10', 20.0);

      expect(res.valid, true);
      expect(voucherService.hasAppliedVoucher, true);
      expect(voucherService.appliedCode, 'WELCOME10');
      expect(voucherService.discountAmount.value, 2.0);
    });

    test('Rejects voucher when subtotal is below minimum spend', () async {
      final res = await voucherService.applyVoucher('KHNEWYEAR', 5.0); // minSpend: 12.0

      expect(res.valid, false);
      expect(voucherService.hasAppliedVoucher, false);
      expect(voucherService.voucherError.value, isNotNull);
    });

    test('Rejects unknown voucher code', () async {
      final res = await voucherService.applyVoucher('NOTEXISTING', 50.0);

      expect(res.valid, false);
      expect(voucherService.hasAppliedVoucher, false);
    });

    test('Removes voucher resets state cleanly', () async {
      await voucherService.applyVoucher('WELCOME10', 20.0);
      expect(voucherService.hasAppliedVoucher, true);

      voucherService.removeVoucher();
      expect(voucherService.hasAppliedVoucher, false);
      expect(voucherService.appliedVoucher.value, isNull);
      expect(voucherService.discountAmount.value, 0.0);
    });

    test('recalculateDiscount removes voucher when subtotal drops below minimum spend', () async {
      await voucherService.applyVoucher('BITECRAFT2', 12.0); // minSpend is 10.0
      expect(voucherService.hasAppliedVoucher, true);

      voucherService.recalculateDiscount(8.0); // now below minSpend
      expect(voucherService.hasAppliedVoucher, false);
      expect(voucherService.discountAmount.value, 0.0);
    });
  });

  group('CartService + Voucher Integration Tests', () {
    test('Deducts voucher discount from cart totalAmount', () async {
      cartService.addItem(testFood1, quantity: 2); // subtotal = $20.00, deliveryFee = $0.00 (>= $20)
      expect(cartService.subtotal, 20.00);

      await voucherService.applyVoucher('WELCOME10', cartService.subtotal); // 10% = $2.00
      expect(cartService.discountAmount, 2.00);
      expect(cartService.totalAmount, 18.00); // $20 - $2.00
    });

    test('Removing item updates discount and removes voucher if minSpend not met', () async {
      cartService.addItem(testFood1, quantity: 1); // $10.00
      cartService.addItem(testFood2, quantity: 1); // $4.00, subtotal = $14.00
      expect(cartService.subtotal, 14.00);

      await voucherService.applyVoucher('KHNEWYEAR', cartService.subtotal); // minSpend: 12.0
      expect(voucherService.hasAppliedVoucher, true);

      cartService.removeItem('food_1'); // subtotal drops to $4.00 (< 12.0)
      expect(voucherService.hasAppliedVoucher, false);
      expect(cartService.discountAmount, 0.0);
    });

    test('Clearing cart removes voucher automatically', () async {
      cartService.addItem(testFood1, quantity: 2);
      await voucherService.applyVoucher('WELCOME10', cartService.subtotal);
      expect(voucherService.hasAppliedVoucher, true);

      cartService.clearCart();
      expect(voucherService.hasAppliedVoucher, false);
      expect(cartService.discountAmount, 0.0);
    });
  });
}

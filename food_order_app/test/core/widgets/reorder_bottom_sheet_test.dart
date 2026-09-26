import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/core/services/cart_service.dart';
import 'package:food_order_app/core/widgets/reorder_bottom_sheet.dart';
import 'package:food_order_app/domain/food/entities/food_entity.dart';
import 'package:food_order_app/domain/order/entities/order_entity.dart';
import 'package:food_order_app/routes/app_routes.dart';

void main() {
  late CartService cartService;

  final sampleOrder = OrderEntity(
    id: 'ord_reorder_1',
    userId: 'u1',
    items: const [
      OrderItemEntity(
        id: 'item_1',
        foodId: 'food_1',
        foodName: 'Truffle Wagyu Burger',
        foodImageUrl: '',
        price: 15.00,
        quantity: 2,
      ),
      OrderItemEntity(
        id: 'item_2',
        foodId: 'food_2',
        foodName: 'Curly Fries',
        foodImageUrl: '',
        price: 5.00,
        quantity: 1,
      ),
    ],
    totalAmount: 35.00,
    deliveryAddress: 'Street 271, Phnom Penh',
    status: 'delivered',
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    createdAt: DateTime.now().subtract(const Duration(days: 2)),
  );

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    cartService = Get.put(CartService(), permanent: true);
    cartService.clearCart();
  });

  tearDown(() {
    Get.reset();
  });

  group('ReorderBottomSheet Widget Tests', () {
    testWidgets('renders all items from past order with quantities and subtotal', (tester) async {
      await tester.pumpWidget(
        GetMaterialApp(
          getPages: [
            GetPage(name: AppRoutes.cart, page: () => const Scaffold()),
          ],
          home: Scaffold(
            body: ReorderBottomSheet(order: sampleOrder),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Reorder Dishes'), findsOneWidget);
      expect(find.text('Truffle Wagyu Burger'), findsOneWidget);
      expect(find.text('Curly Fries'), findsOneWidget);
      expect(find.text('\$15.00'), findsOneWidget);
      expect(find.text('\$5.00'), findsOneWidget);
      expect(find.text('Reorder 3 Items • \$35.00'), findsOneWidget);
    });

    testWidgets('adjusting item quantity via stepper updates subtotal', (tester) async {
      await tester.pumpWidget(
        GetMaterialApp(
          getPages: [
            GetPage(name: AppRoutes.cart, page: () => const Scaffold()),
          ],
          home: Scaffold(
            body: ReorderBottomSheet(order: sampleOrder),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap + button on Curly Fries (starts at 1 -> goes to 2)
      final addButtons = find.byIcon(Icons.add_rounded);
      expect(addButtons, findsNWidgets(2));
      await tester.tap(addButtons.last);
      await tester.pumpAndSettle();

      // Total items now 2 + 2 = 4, total price: 2*15 + 2*5 = 40.00
      expect(find.text('Reorder 4 Items • \$40.00'), findsOneWidget);
    });

    testWidgets('confirming reorder adds items to CartService', (tester) async {
      await tester.pumpWidget(
        GetMaterialApp(
          getPages: [
            GetPage(name: AppRoutes.cart, page: () => const Scaffold()),
          ],
          home: Scaffold(
            body: ReorderBottomSheet(order: sampleOrder),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(cartService.isEmpty, true);

      // Tap Confirm Reorder
      await tester.tap(find.text('Reorder 3 Items • \$35.00'));
      await tester.pump();

      expect(cartService.isEmpty, false);
      expect(cartService.items.length, 2);
      expect(cartService.totalQuantity, 3);
      expect(cartService.subtotal, 35.00);
    });

    testWidgets('shows cart conflict notice when cart is not empty and allows Replace Cart', (tester) async {
      // Put existing item in cart
      cartService.addItem(
        const FoodEntity(
          id: 'old_food',
          name: 'Old Pizza',
          price: 10.00,
        ),
        quantity: 1,
      );
      expect(cartService.items.length, 1);

      await tester.pumpWidget(
        GetMaterialApp(
          getPages: [
            GetPage(name: AppRoutes.cart, page: () => const Scaffold()),
          ],
          home: Scaffold(
            body: ReorderBottomSheet(order: sampleOrder),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Conflict warning should appear
      expect(find.text('Cart has 1 items (\$10.00)'), findsOneWidget);
      expect(find.text('Replace Cart'), findsOneWidget);
      expect(find.text('Add to Cart'), findsOneWidget);

      // Select Replace Cart
      await tester.tap(find.text('Replace Cart'));
      await tester.pumpAndSettle();

      // Confirm reorder
      await tester.tap(find.text('Reorder 3 Items • \$35.00'));
      await tester.pump();

      // Old item should be replaced by new reorder items
      expect(cartService.items.any((item) => item.food.id == 'old_food'), false);
      expect(cartService.items.length, 2);
      expect(cartService.totalQuantity, 3);
      expect(cartService.subtotal, 35.00);
    });
  });
}

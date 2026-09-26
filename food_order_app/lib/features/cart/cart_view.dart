import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import 'cart_intent.dart';
import 'cart_store.dart';
import 'widgets/widgets.dart';

class CartView extends GetView<CartStore> {
  const CartView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceBg = isDark ? const Color(0xFF121826) : const Color(0xFFF9FAFB);

    return Scaffold(
      backgroundColor: surfaceBg,
      appBar: AppBar(
        backgroundColor: surfaceBg,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Get.back(),
        ),
        title: const Text(
          'My Cart',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          Obx(() {
            if (controller.cartService.isEmpty) return const SizedBox.shrink();
            return TextButton(
              onPressed: () => controller.onIntent(const CartClear()),
              child: const Text(
                'Clear All',
                style: TextStyle(
                  color: Color(0xFFEF4444),
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            );
          }),
        ],
      ),
      body: Obx(() {
        if (controller.cartService.isEmpty) {
          return _buildEmptyState(context, isDark);
        }

        final items = controller.cartService.items;

        return ListView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          children: [
            // Items List
            ...items.map(
              (item) => CartItemTile(
                key: ValueKey('${item.food.id}_${item.specialInstructions}'),
                item: item,
                onIncrement: () => controller.onIntent(CartIncrementQty(item.food.id)),
                onDecrement: () => controller.onIntent(CartDecrementQty(item.food.id)),
                onRemove: () => controller.onIntent(CartRemoveItem(item.food.id)),
              ),
            ),
            const SizedBox(height: 12),

            // Promo Code & Voucher
            const CartVoucherCard(),
            const SizedBox(height: 16),

            // Bill Summary
            const CartBillSummary(),

            const SizedBox(height: 120), // Bottom clearance for sticky bar
          ],
        );
      }),
      bottomNavigationBar: Obx(() {
        if (controller.cartService.isEmpty) return const SizedBox.shrink();
        return const CartBottomBar();
      }),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.shopping_bag_outlined,
                size: 50,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Your cart is empty',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Looks like you haven\'t added any delicious food to your cart yet.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.white60 : AppColors.subtitleColor,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 28),
            ElevatedButton(
              onPressed: () => Get.back(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.restaurant_menu_rounded, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Explore Foods',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

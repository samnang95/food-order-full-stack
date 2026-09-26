import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../constants/app_colors.dart';
import '../services/cart_service.dart';
import '../../domain/food/entities/food_entity.dart';
import '../../domain/order/entities/order_entity.dart';
import '../../routes/app_routes.dart';

class ReorderBottomSheet extends StatefulWidget {
  final OrderEntity order;

  const ReorderBottomSheet({
    super.key,
    required this.order,
  });

  static Future<void> show(BuildContext context, {required OrderEntity order}) async {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF141A29) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => ReorderBottomSheet(order: order),
    );
  }

  @override
  State<ReorderBottomSheet> createState() => _ReorderBottomSheetState();
}

class _ReorderBottomSheetState extends State<ReorderBottomSheet> {
  late final CartService _cartService;
  late final Map<String, bool> _selectedItems;
  late final Map<String, int> _itemQuantities;
  bool _replaceCart = false;

  @override
  void initState() {
    super.initState();
    _cartService = Get.isRegistered<CartService>()
        ? Get.find<CartService>()
        : Get.put(CartService(), permanent: true);

    _selectedItems = {
      for (final item in widget.order.items) item.id: true,
    };
    _itemQuantities = {
      for (final item in widget.order.items) item.id: item.quantity,
    };
  }

  int get _selectedItemCount {
    return widget.order.items.where((item) => _selectedItems[item.id] == true).fold(
          0,
          (sum, item) => sum + (_itemQuantities[item.id] ?? 1),
        );
  }

  double get _reorderSubtotal {
    return widget.order.items.where((item) => _selectedItems[item.id] == true).fold(
          0.0,
          (sum, item) => sum + (item.price * (_itemQuantities[item.id] ?? 1)),
        );
  }

  void _handleConfirm() {
    final itemsToReorder = widget.order.items.where((item) => _selectedItems[item.id] == true).toList();
    if (itemsToReorder.isEmpty) return;

    if (_replaceCart) {
      _cartService.clearCart();
    }

    for (final item in itemsToReorder) {
      final qty = _itemQuantities[item.id] ?? item.quantity;
      final food = FoodEntity(
        id: item.foodId,
        name: item.foodName,
        price: item.price,
        imageUrl: item.foodImageUrl,
      );
      _cartService.addItem(food, quantity: qty);
    }

    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }

    if (!Get.testMode && Get.context != null) {
      Get.snackbar(
        'Items Added to Cart! 🛒',
        'Added $_selectedItemCount item${_selectedItemCount == 1 ? '' : 's'} from ${widget.order.shortId}',
        backgroundColor: const Color(0xFF10B981),
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP,
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
        duration: const Duration(seconds: 3),
        mainButton: TextButton(
          onPressed: () => Get.toNamed(AppRoutes.cart),
          child: const Text(
            'View Cart',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );

      try {
        Get.toNamed(AppRoutes.cart);
      } catch (e) {
        debugPrint('⚠️ [ReorderBottomSheet] Navigation error to cart: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : const Color(0xFFF8FAFC);
    final borderColor = isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0);
    final hasExistingCart = _cartService.isNotEmpty;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Title Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Reorder Dishes',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : AppColors.neutral,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'From ${widget.order.shortId} • ${widget.order.formattedDate}',
                        style: TextStyle(
                          fontSize: 12.5,
                          color: isDark ? Colors.white54 : AppColors.subtitleColor,
                        ),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF28344C) : const Color(0xFFF1F5F9),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.close_rounded,
                        size: 18,
                        color: isDark ? Colors.white70 : const Color(0xFF64748B),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Cart Conflict Notice (if cart already has items)
              if (hasExistingCart) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.shopping_cart_outlined,
                            size: 18,
                            color: Color(0xFFD97706),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Cart has ${_cartService.totalQuantity} items (\$${_cartService.subtotal.toStringAsFixed(2)})',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFD97706),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _replaceCart = false),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 7),
                                decoration: BoxDecoration(
                                  color: !_replaceCart ? AppColors.primary : Colors.transparent,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: !_replaceCart ? AppColors.primary : borderColor,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    'Add to Cart',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: !_replaceCart ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _replaceCart = true),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 7),
                                decoration: BoxDecoration(
                                  color: _replaceCart ? AppColors.primary : Colors.transparent,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: _replaceCart ? AppColors.primary : borderColor,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    'Replace Cart',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: _replaceCart ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Items Selection List
              Text(
                'Select Items to Reorder',
                style: TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white70 : AppColors.neutral,
                ),
              ),
              const SizedBox(height: 8),

              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: widget.order.items.length,
                separatorBuilder: (context, index) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final item = widget.order.items[index];
                  final isSelected = _selectedItems[item.id] ?? true;
                  final qty = _itemQuantities[item.id] ?? item.quantity;

                  return Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary.withValues(alpha: 0.5)
                            : borderColor,
                        width: isSelected ? 1.4 : 1.0,
                      ),
                    ),
                    child: Row(
                      children: [
                        // Checkbox
                        Checkbox(
                          value: isSelected,
                          activeColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(5),
                          ),
                          onChanged: (val) {
                            setState(() {
                              _selectedItems[item.id] = val ?? false;
                            });
                          },
                        ),

                        // Food Image
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            width: 50,
                            height: 50,
                            color: isDark ? const Color(0xFF283044) : const Color(0xFFF1F5F9),
                            child: item.foodImageUrl.isNotEmpty
                                ? Image.network(
                                    item.foodImageUrl,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, _, _) => _buildPlaceholder(isDark),
                                  )
                                : _buildPlaceholder(isDark),
                          ),
                        ),
                        const SizedBox(width: 10),

                        // Name & Price
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.foodName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? Colors.white : AppColors.neutral,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                '\$${item.price.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Quantity Stepper
                        if (isSelected)
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _buildStepBtn(
                                icon: Icons.remove_rounded,
                                isDark: isDark,
                                onTap: () {
                                  if (qty > 1) {
                                    setState(() {
                                      _itemQuantities[item.id] = qty - 1;
                                    });
                                  } else {
                                    setState(() {
                                      _selectedItems[item.id] = false;
                                    });
                                  }
                                },
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 8),
                                child: Text(
                                  '$qty',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13.5,
                                    color: isDark ? Colors.white : AppColors.neutral,
                                  ),
                                ),
                              ),
                              _buildStepBtn(
                                icon: Icons.add_rounded,
                                isDark: isDark,
                                onTap: () {
                                  setState(() {
                                    _itemQuantities[item.id] = qty + 1;
                                  });
                                },
                              ),
                            ],
                          ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 20),

              // Action CTA Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _selectedItemCount > 0 ? _handleConfirm : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    disabledBackgroundColor: isDark ? const Color(0xFF28344C) : const Color(0xFFE2E8F0),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.replay_rounded, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        _selectedItemCount > 0
                            ? 'Reorder $_selectedItemCount Item${_selectedItemCount == 1 ? '' : 's'} • \$${_reorderSubtotal.toStringAsFixed(2)}'
                            : 'Select at least 1 item',
                        style: const TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepBtn({
    required IconData icon,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 26,
        height: 26,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
          borderRadius: BorderRadius.circular(7),
        ),
        child: Icon(
          icon,
          size: 15,
          color: isDark ? Colors.white : AppColors.neutral,
        ),
      ),
    );
  }

  Widget _buildPlaceholder(bool isDark) {
    return Center(
      child: Icon(
        Icons.restaurant_rounded,
        size: 24,
        color: isDark ? Colors.white24 : const Color(0xFFCBD5E1),
      ),
    );
  }
}

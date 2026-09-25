import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../domain/order/entities/order_entity.dart';
import '../../routes/app_routes.dart';

class OrderSuccessView extends StatelessWidget {
  const OrderSuccessView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;
    final textMuted = isDark ? Colors.white60 : AppColors.subtitleColor;

    final order = Get.arguments is OrderEntity ? Get.arguments as OrderEntity : null;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _goToHome(0);
      },
      child: Scaffold(
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),

                // Animated Success Checkmark
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF10B981), Color(0xFF059669)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF10B981).withValues(alpha: 0.35),
                        blurRadius: 24,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.check_rounded,
                      color: Colors.white,
                      size: 56,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Success Title & Subtitle
                Text(
                  'Order Placed! 🎉',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : AppColors.neutral,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Your order has been sent to the restaurant and is now being prepared.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: textMuted,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 28),

                // Order Details Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: borderColor),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
                        blurRadius: 14,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      _buildDetailRow(
                        label: 'Order ID',
                        value: order?.shortId ?? '#BC-LIVE',
                        isHighlight: true,
                        isDark: isDark,
                      ),
                      const SizedBox(height: 12),
                      _buildDetailRow(
                        label: 'Estimated Delivery',
                        value: '25 - 35 mins',
                        isDark: isDark,
                        badgeColor: const Color(0xFF10B981),
                      ),
                      const SizedBox(height: 12),
                      _buildDetailRow(
                        label: 'Payment Method',
                        value: order?.paymentMethod.toUpperCase() ?? 'CASH',
                        isDark: isDark,
                      ),
                      const SizedBox(height: 12),
                      _buildDetailRow(
                        label: 'Total Amount',
                        value: order != null
                            ? '\$${order.totalAmount.toStringAsFixed(2)}'
                            : '\$0.00',
                        isPrice: true,
                        isDark: isDark,
                      ),
                    ],
                  ),
                ),

                const Spacer(),

                // Action Buttons
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _goToHome(2), // Orders Tab
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.receipt_long_rounded, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Track My Order',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () => _goToHome(0), // Explore Tab
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      foregroundColor: isDark ? Colors.white70 : AppColors.subtitleColor,
                    ),
                    child: const Text(
                      'Back to Explore',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _goToHome(int tabIndex) {
    Get.offAllNamed(AppRoutes.home, arguments: tabIndex);
  }

  Widget _buildDetailRow({
    required String label,
    required String value,
    required bool isDark,
    bool isHighlight = false,
    bool isPrice = false,
    Color? badgeColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13.5,
            color: isDark ? Colors.white60 : AppColors.subtitleColor,
          ),
        ),
        if (badgeColor != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: badgeColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              value,
              style: TextStyle(
                color: badgeColor,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          )
        else
          Text(
            value,
            style: TextStyle(
              fontSize: isPrice ? 16 : 14,
              fontWeight: isHighlight || isPrice ? FontWeight.w800 : FontWeight.w600,
              color: isPrice
                  ? AppColors.primary
                  : (isDark ? Colors.white : AppColors.neutral),
            ),
          ),
      ],
    );
  }
}

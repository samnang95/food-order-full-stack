import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../domain/order/entities/order_entity.dart';

class OrderDetailSummaryCard extends StatelessWidget {
  final OrderEntity order;

  const OrderDetailSummaryCard({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;
    final textMuted = isDark ? Colors.white60 : AppColors.subtitleColor;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.receipt_rounded,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Payment Summary',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppColors.neutral,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildRow('Order ID', order.shortId, isDark, textMuted, isBold: true),
          const SizedBox(height: 10),
          _buildRow('Date & Time', order.formattedDate, isDark, textMuted),
          const SizedBox(height: 10),
          _buildRow(
            'Payment Method',
            order.paymentMethod.toUpperCase(),
            isDark,
            textMuted,
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Payment Status',
                style: TextStyle(fontSize: 13.5, color: textMuted),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: order.paymentStatus == 'completed'
                      ? const Color(0xFF10B981).withValues(alpha: 0.15)
                      : const Color(0xFFF59E0B).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  order.paymentStatus.toUpperCase(),
                  style: TextStyle(
                    color: order.paymentStatus == 'completed'
                        ? const Color(0xFF10B981)
                        : const Color(0xFFF59E0B),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Divider(color: isDark ? const Color(0xFF2A364F) : const Color(0xFFF3F4F6)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Paid',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : AppColors.neutral,
                ),
              ),
              Text(
                '\$${order.totalAmount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRow(
    String label,
    String value,
    bool isDark,
    Color textMuted, {
    bool isBold = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 13.5, color: textMuted),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13.5,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: isDark ? Colors.white : AppColors.neutral,
          ),
        ),
      ],
    );
  }
}

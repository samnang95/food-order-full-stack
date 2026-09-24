import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../domain/order/entities/order_entity.dart';

class OrderTrackingStepper extends StatelessWidget {
  final OrderEntity order;

  const OrderTrackingStepper({super.key, required this.order});

  int get _currentStepIndex {
    switch (order.status) {
      case 'pending':
        return 0;
      case 'preparing':
        return 1;
      case 'out_for_delivery':
        return 2;
      case 'delivered':
        return 3;
      default:
        return -1; // cancelled or unknown
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    if (order.isCancelled) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF2C1A1A) : const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(0xFFEF4444).withValues(alpha: 0.4),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.cancel_rounded,
                color: Color(0xFFEF4444),
                size: 28,
              ),
            ),
            const SizedBox(width: 14),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Order Cancelled',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFEF4444),
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'This order was cancelled and is no longer active.',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    final steps = [
      {
        'title': 'Order Placed',
        'subtitle': 'Restaurant accepted',
        'icon': Icons.receipt_long_rounded,
      },
      {
        'title': 'Kitchen Preparing',
        'subtitle': 'Chef is cooking your meal',
        'icon': Icons.soup_kitchen_rounded,
      },
      {
        'title': 'On the Way',
        'subtitle': 'Rider is heading to you',
        'icon': Icons.delivery_dining_rounded,
      },
      {
        'title': 'Delivered',
        'subtitle': 'Enjoy your meal!',
        'icon': Icons.check_circle_rounded,
      },
    ];

    final currentIndex = _currentStepIndex;

    return Container(
      padding: const EdgeInsets.all(18),
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Live Delivery Status',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : AppColors.neutral,
                ),
              ),
              if (order.isActive)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.timer_outlined, size: 13, color: AppColors.primary),
                      SizedBox(width: 4),
                      Text(
                        '20-30 mins',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: steps.length,
            itemBuilder: (context, index) {
              final step = steps[index];
              final isDone = index < currentIndex;
              final isCurrent = index == currentIndex;
              final isLast = index == steps.length - 1;

              Color stepColor;
              if (isDone) {
                stepColor = const Color(0xFF10B981); // Emerald
              } else if (isCurrent) {
                stepColor = AppColors.primary; // Brand orange
              } else {
                stepColor = isDark ? Colors.white24 : Colors.black26;
              }

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: isDone || isCurrent
                              ? stepColor
                              : (isDark ? const Color(0xFF161C2C) : const Color(0xFFF3F4F6)),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: stepColor,
                            width: 2,
                          ),
                          boxShadow: isCurrent
                              ? [
                                  BoxShadow(
                                    color: stepColor.withValues(alpha: 0.4),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                        child: Icon(
                          isDone
                              ? Icons.check_rounded
                              : (step['icon'] as IconData),
                          color: isDone || isCurrent
                              ? Colors.white
                              : (isDark ? Colors.white38 : Colors.black38),
                          size: 16,
                        ),
                      ),
                      if (!isLast)
                        Container(
                          width: 2,
                          height: 32,
                          color: isDone ? const Color(0xFF10B981) : (isDark ? Colors.white12 : Colors.black12),
                        ),
                    ],
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 4, bottom: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            step['title'] as String,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: isCurrent ? FontWeight.w800 : (isDone ? FontWeight.w700 : FontWeight.w500),
                              color: isCurrent
                                  ? AppColors.primary
                                  : (isDark
                                      ? (isDone ? Colors.white : Colors.white54)
                                      : (isDone ? AppColors.neutral : Colors.black45)),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            step['subtitle'] as String,
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.white54 : AppColors.subtitleColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

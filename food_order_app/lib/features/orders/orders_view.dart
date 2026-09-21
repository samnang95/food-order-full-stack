import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../main_navigation/main_nav_intent.dart';
import '../main_navigation/main_nav_store.dart';

class OrdersView extends StatefulWidget {
  const OrdersView({super.key});

  @override
  State<OrdersView> createState() => _OrdersViewState();
}

class _OrdersViewState extends State<OrdersView> {
  int _selectedFilter = 0; // 0: All, 1: Active, 2: Completed

  final List<Map<String, dynamic>> _sampleOrders = [
    {
      'id': '#BC-9821',
      'date': 'Today, 12:45 PM',
      'restaurant': 'BiteCraft Burgers & Fries',
      'items': '2x Double Cheese Burger, 1x Truffle Fries',
      'total': '\$24.50',
      'status': 'On the way',
      'statusColor': Color(0xFFF97316),
      'isActive': true,
      'eta': 'Est. arrival in 12 mins',
    },
    {
      'id': '#BC-8492',
      'date': 'Yesterday, 7:15 PM',
      'restaurant': 'Tokyo Ramen House',
      'items': '1x Spicy Tonkotsu Ramen, 1x Gyoza',
      'total': '\$19.80',
      'status': 'Delivered',
      'statusColor': Color(0xFF10B981),
      'isActive': false,
      'eta': 'Delivered yesterday',
    },
    {
      'id': '#BC-7310',
      'date': '14 Sep 2026',
      'restaurant': 'Bella Italia Pizzeria',
      'items': '1x Margherita Pizza (L), 2x Cola Zero',
      'total': '\$22.00',
      'status': 'Delivered',
      'statusColor': Color(0xFF10B981),
      'isActive': false,
      'eta': 'Delivered to Home',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;

    final filteredOrders = _sampleOrders.where((order) {
      if (_selectedFilter == 1) return order['isActive'] == true;
      if (_selectedFilter == 2) return order['isActive'] == false;
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'ordersTitle'.getString(context).isNotEmpty
                  ? 'ordersTitle'.getString(context)
                  : 'My Orders',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              'ordersSubtitle'.getString(context).isNotEmpty
                  ? 'ordersSubtitle'.getString(context)
                  : 'Track live delivery & past orders',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isDark ? Colors.white60 : AppColors.subtitleColor,
                  ),
            ),
          ],
        ),
        titleSpacing: 16,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Filter Pills
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Row(
                children: [
                  _buildFilterChip(0, 'All Orders (${_sampleOrders.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip(1, 'Active (1)'),
                  const SizedBox(width: 8),
                  _buildFilterChip(2, 'Completed (2)'),
                ],
              ),
            ),
            Expanded(
              child: filteredOrders.isEmpty
                  ? _buildEmptyState(context, isDark)
                  : ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: filteredOrders.length,
                      itemBuilder: (context, index) {
                        final order = filteredOrders[index];
                        final statusColor = order['statusColor'] as Color;
                        final isActive = order['isActive'] as bool;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isActive
                                  ? AppColors.primary.withValues(alpha: 0.5)
                                  : (isDark
                                      ? const Color(0xFF2E3A52)
                                      : AppColors.borderColor),
                              width: isActive ? 1.5 : 1.0,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: isActive
                                    ? AppColors.primary.withValues(alpha: 0.08)
                                    : Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        order['id'] as String,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15,
                                          color: isDark ? Colors.white : AppColors.neutral,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        order['date'] as String,
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: isDark ? Colors.white54 : AppColors.subtitleColor,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: statusColor.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        if (isActive) ...[
                                          Container(
                                            width: 6,
                                            height: 6,
                                            decoration: BoxDecoration(
                                              color: statusColor,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                          const SizedBox(width: 5),
                                        ],
                                        Text(
                                          order['status'] as String,
                                          style: TextStyle(
                                            color: statusColor,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11.5,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 20),
                              Text(
                                order['restaurant'] as String,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                order['items'] as String,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: isDark ? Colors.white70 : AppColors.subtitleColor,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    order['total'] as String,
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 16,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  Text(
                                    order['eta'] as String,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                      color: isDark ? Colors.white60 : Colors.black54,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(int index, String label) {
    final isSelected = _selectedFilter == index;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = index;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : (isDark ? const Color(0xFF1E2638) : const Color(0xFFF3ECE7)),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected
                ? Colors.white
                : (isDark ? Colors.white70 : AppColors.subtitleColor),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.receipt_long_rounded,
                size: 40,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'noOrdersYet'.getString(context).isNotEmpty
                  ? 'noOrdersYet'.getString(context)
                  : 'No orders placed yet',
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'noOrdersDesc'.getString(context).isNotEmpty
                  ? 'noOrdersDesc'.getString(context)
                  : 'Explore delicious dishes and place your first order now!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white60 : AppColors.subtitleColor,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                if (Get.isRegistered<MainNavStore>()) {
                  Get.find<MainNavStore>().onIntent(const ChangeTabIntent(0));
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              child: Text(
                'startOrdering'.getString(context).isNotEmpty
                    ? 'startOrdering'.getString(context)
                    : 'Explore Food Now',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

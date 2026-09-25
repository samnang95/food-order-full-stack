import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:food_order_app/core/constants/app_images.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../data/order/datasources/order_remote_datasource.dart';
import '../../data/order/repositories/order_repository_impl.dart';
import '../../domain/order/entities/order_entity.dart';
import '../../domain/order/repositories/order_repository.dart';
import '../../routes/app_routes.dart';
import '../main_navigation/main_nav_intent.dart';
import '../main_navigation/main_nav_store.dart';
import '../notifications/notification_store.dart';
import 'orders_intent.dart';
import 'orders_store.dart';

class OrdersView extends StatelessWidget {
  const OrdersView({super.key});

  OrdersStore get controller {
    if (Get.isRegistered<OrdersStore>()) {
      return Get.find<OrdersStore>();
    }
    final remote = Get.isRegistered<OrderRemoteDataSource>()
        ? Get.find<OrderRemoteDataSource>()
        : Get.put<OrderRemoteDataSource>(OrderRemoteDataSourceImpl());
    final repo = Get.isRegistered<OrderRepository>()
        ? Get.find<OrderRepository>()
        : Get.put<OrderRepository>(OrderRepositoryImpl(remoteDataSource: remote));
    return Get.put(OrdersStore(orderRepository: repo));
  }

  String _loc(BuildContext context, String key, String fallback) {
    final str = key.getString(context);
    if (str.isEmpty || str.endsWith('not found') || str == key) {
      return fallback;
    }
    return str;
  }

  @override
  Widget build(BuildContext context) {
    final store = controller;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final scaffoldBg = Theme.of(context).scaffoldBackgroundColor;
    final isScrolled = ValueNotifier<bool>(false);

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: scaffoldBg,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Row(
          children: [
            Image.asset(AppImages.bitecraftLogo, height: 36),
            const SizedBox(width: 4),
            Text(
              _loc(context, 'ordersTitle', 'My Orders'),
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ],
        ),
        titleSpacing: 12,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
              child: GestureDetector(
                onTap: () {
                  Get.toNamed(AppRoutes.notifications);
                },
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    const Icon(Icons.notifications_outlined, size: 24),
                    if (Get.isRegistered<NotificationStore>())
                      Obx(() {
                        final unread = Get.find<NotificationStore>().unreadCount;
                        if (unread == 0) return const SizedBox.shrink();
                        return Positioned(
                          top: -4,
                          right: -4,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4.5, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isDark ? const Color(0xFF141A29) : Colors.white,
                                width: 1.5,
                              ),
                            ),
                            child: Text(
                              '$unread',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        );
                      }),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Obx(() {
          final state = store.state.value;
          final filteredOrders = state.filteredOrders;
          final totalCount = state.orders.length;
          final activeCount = state.activeCount;
          final completedCount = state.completedCount;

          return Column(
            children: [
              // Filter Pills with subtle shadow when scrolling
              ValueListenableBuilder<bool>(
                valueListenable: isScrolled,
                builder: (context, scrolled, child) {
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color: scaffoldBg,
                      boxShadow: scrolled
                          ? [
                              BoxShadow(
                                color: isDark
                                    ? Colors.black.withValues(alpha: 0.35)
                                    : Colors.black.withValues(alpha: 0.05),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ]
                          : [],
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                    child: child,
                  );
                },
                child: Row(
                  children: [
                    _buildFilterChip(
                      index: 0,
                      label: 'All ($totalCount)',
                      selectedIndex: state.selectedFilter,
                      isDark: isDark,
                      onTap: () => store.onIntent(const ChangeOrdersFilterIntent(0)),
                    ),
                    const SizedBox(width: 8),
                    _buildFilterChip(
                      index: 1,
                      label: 'Active ($activeCount)',
                      selectedIndex: state.selectedFilter,
                      isDark: isDark,
                      onTap: () => store.onIntent(const ChangeOrdersFilterIntent(1)),
                    ),
                    const SizedBox(width: 8),
                    _buildFilterChip(
                      index: 2,
                      label: 'Completed ($completedCount)',
                      selectedIndex: state.selectedFilter,
                      isDark: isDark,
                      onTap: () => store.onIntent(const ChangeOrdersFilterIntent(2)),
                    ),
                  ],
                ),
              ),

              // Orders List, Error State, or Empty State
              Expanded(
                child: NotificationListener<ScrollNotification>(
                  onNotification: (notification) {
                    final scrolledNow = notification.metrics.pixels > 5;
                    if (isScrolled.value != scrolledNow) {
                      isScrolled.value = scrolledNow;
                    }
                    return false;
                  },
                  child: RefreshIndicator(
                    color: AppColors.primary,
                    onRefresh: () async => store.onIntent(const FetchOrdersIntent()),
                  child: state.isLoading && state.orders.isEmpty
                      ? const Center(
                          child: CircularProgressIndicator(color: AppColors.primary),
                        )
                      : state.errorMessage != null && state.orders.isEmpty
                          ? _buildErrorState(context, isDark, state.errorMessage!, () {
                              store.onIntent(const FetchOrdersIntent());
                            })
                          : filteredOrders.isEmpty
                              ? _buildEmptyState(context, isDark)
                              : ListView.builder(
                                  physics: const AlwaysScrollableScrollPhysics(
                                    parent: BouncingScrollPhysics(),
                                  ),
                                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                                  itemCount: filteredOrders.length,
                                  itemBuilder: (context, index) {
                                    final order = filteredOrders[index];
                                    return _buildOrderCard(order, isDark, cardBg);
                                  },
                                ),
                      ),
                    ),
                  ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildOrderCard(OrderEntity order, bool isDark, Color cardBg) {
    final statusColor = order.statusColor;
    final isActive = order.isActive;

    return GestureDetector(
      onTap: () => Get.toNamed(AppRoutes.orderDetail, arguments: order),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isActive
                ? AppColors.primary.withValues(alpha: 0.5)
                : (isDark ? const Color(0xFF2E3A52) : AppColors.borderColor),
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
            // Order ID & Status Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      order.shortId,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                        color: isDark ? Colors.white : AppColors.neutral,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      order.formattedDate,
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
                        order.statusLabel,
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

            // Items summary
            Text(
              order.itemsSummary,
              style: TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
            if (order.deliveryAddress.isNotEmpty) ...[
              const SizedBox(height: 6),
              Row(
                children: [
                  Icon(
                    Icons.location_on_outlined,
                    size: 14,
                    color: isDark ? Colors.white54 : AppColors.subtitleColor,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      order.deliveryAddress,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white54 : AppColors.subtitleColor,
                      ),
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 12),

            // Total Price & Payment Method
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '\$${order.totalAmount.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    color: AppColors.primary,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF161C2C) : const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        order.paymentMethod.toUpperCase(),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white60 : Colors.black54,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 12,
                      color: isDark ? Colors.white38 : Colors.black38,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip({
    required int index,
    required String label,
    required int selectedIndex,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    final isSelected = selectedIndex == index;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : (isDark ? const Color(0xFF1E2638) : const Color(0xFFF3ECE7)),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : (isDark ? Colors.white70 : AppColors.subtitleColor),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 80.0),
        alignment: Alignment.center,
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
              _loc(context, 'noOrdersYet', 'No orders yet'),
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _loc(
                context,
                'noOrdersDesc',
                'Explore delicious dishes and place your first order!',
              ),
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
                _loc(context, 'startOrdering', 'Explore Menu'),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(
    BuildContext context,
    bool isDark,
    String errorMessage,
    VoidCallback onRetry,
  ) {
    final isConnectionError = errorMessage.contains('SSL') ||
        errorMessage.contains('SocketException') ||
        errorMessage.contains('timed out') ||
        errorMessage.contains('connect');

    final displayMessage = isConnectionError
        ? 'Could not connect to the database server. If testing on a new network, make sure your current IP address is whitelisted in MongoDB Atlas.'
        : errorMessage;

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 80.0),
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFFEF4444).withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.wifi_off_rounded,
                size: 40,
                color: Color(0xFFEF4444),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Unable to Load Orders',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              displayMessage,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white60 : AppColors.subtitleColor,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text(
                'Try Again',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

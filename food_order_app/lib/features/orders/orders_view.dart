import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_images.dart';
import '../../core/locale/translation_helper.dart';
import '../../routes/app_routes.dart';
import '../notifications/notification_store.dart';
import 'orders_intent.dart';
import 'orders_store.dart';
import 'widgets/widgets.dart';

class OrdersView extends GetView<OrdersStore> {
  const OrdersView({super.key});

  OrdersStore get store =>
      Get.isRegistered<OrdersStore>() ? controller : OrdersStore.instance;

  @override
  Widget build(BuildContext context) {
    final currentStore = store;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final scaffoldBg = Theme.of(context).scaffoldBackgroundColor;

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: scaffoldBg,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        titleSpacing: 12,
        title: Row(
          children: [
            Image.asset(AppImages.bitecraftLogo, height: 36),
            const SizedBox(width: 4),
            Text(
              'ordersTitle'.trOr(context, 'My Orders'),
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
              child: GestureDetector(
                onTap: () => Get.toNamed(AppRoutes.notifications),
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
                            padding: const EdgeInsets.symmetric(
                              horizontal: 4.5,
                              vertical: 1.5,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isDark
                                    ? const Color(0xFF141A29)
                                    : Colors.white,
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
          final state = currentStore.state.value;
          final filteredOrders = state.filteredOrders;

          return Column(
            children: [
              // Filter Tabs with count badges and smooth scroll indicator
              OrderFilterPills(
                selectedFilter: state.selectedFilter,
                totalCount: state.totalCount,
                activeCount: state.activeCount,
                completedCount: state.completedCount,
                cancelledCount: state.cancelledCount,
                isScrolled: state.isScrolled,
                onFilterChanged: (index) {
                  currentStore.onIntent(ChangeOrdersFilterIntent(index));
                },
              ),

              // Orders List, Shimmer Skeleton, Error, or Empty State
              Expanded(
                child: NotificationListener<ScrollNotification>(
                  onNotification: (notification) {
                    final scrolled = notification.metrics.pixels > 5;
                    currentStore.onIntent(OrdersScrollChangedIntent(scrolled));
                    return false;
                  },
                  child: RefreshIndicator(
                    color: AppColors.primary,
                    onRefresh: () async =>
                        currentStore.onIntent(const FetchOrdersIntent()),
                    child: state.isLoading && state.orders.isEmpty
                        ? const OrderShimmerLoading()
                        : state.errorMessage != null && state.orders.isEmpty
                            ? OrderErrorState(
                                errorMessage: state.errorMessage!,
                                onRetry: () => currentStore
                                    .onIntent(const FetchOrdersIntent()),
                              )
                            : filteredOrders.isEmpty
                                ? OrderEmptyState(
                                    selectedFilter: state.selectedFilter,
                                  )
                                : ListView.builder(
                                    physics:
                                        const AlwaysScrollableScrollPhysics(
                                      parent: BouncingScrollPhysics(),
                                    ),
                                    padding:
                                        const EdgeInsets.fromLTRB(16, 8, 16, 80),
                                    itemCount: filteredOrders.length,
                                    itemBuilder: (context, index) {
                                      final order = filteredOrders[index];
                                      return OrderCardTile(
                                        order: order,
                                        onTap: () => Get.toNamed(
                                          AppRoutes.orderDetail,
                                          arguments: order,
                                        ),
                                        onReorder: () => currentStore.onIntent(
                                          ReorderOrderIntent(order),
                                        ),
                                      );
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
}

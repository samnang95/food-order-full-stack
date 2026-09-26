import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_images.dart';
import '../../core/locale/translation_helper.dart';
import '../../core/widgets/reorder_bottom_sheet.dart';
import '../../routes/app_routes.dart';
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
                                        onReorder: () => ReorderBottomSheet.show(
                                          context,
                                          order: order,
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

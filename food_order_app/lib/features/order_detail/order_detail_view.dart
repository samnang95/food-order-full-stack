import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import 'order_detail_intent.dart';
import 'order_detail_store.dart';
import 'widgets/widgets.dart';

class OrderDetailView extends GetView<OrderDetailStore> {
  const OrderDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final order = controller.state.value.order;

      return Scaffold(
        appBar: AppBar(
          title: Text(
            'Order ${order.shortId}',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
            onPressed: () => Get.back(),
          ),
          elevation: 0,
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              tooltip: 'Refresh Status',
              onPressed: () => controller.onIntent(const RefreshOrderDetailIntent()),
            ),
          ],
        ),
        body: SafeArea(
          child: RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => controller.onIntent(const RefreshOrderDetailIntent()),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Live Tracking Stepper
                  OrderTrackingStepper(order: order),
                  const SizedBox(height: 16),

                  // 2. Delivery Address Card
                  OrderDetailAddressCard(order: order),
                  const SizedBox(height: 16),

                  // 3. Itemized Receipt
                  OrderDetailItemsCard(order: order),
                  const SizedBox(height: 16),

                  // 4. Payment & Cost Summary
                  OrderDetailSummaryCard(order: order),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ),
        bottomNavigationBar: const OrderDetailBottomBar(),
      );
    });
  }
}

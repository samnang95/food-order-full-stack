import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import 'order_detail_intent.dart';
import 'order_detail_store.dart';
import 'widgets/widgets.dart';
import 'widgets/delivery_map_card.dart';

class OrderDetailView extends GetView<OrderDetailStore> {
  const OrderDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final state = controller.state.value;
      final order = state.order;

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
                  // 0. Live Delivery Map & Rider Contact Card (only when out for delivery)
                  if (order.status == 'out_for_delivery' || state.isTrackingActive) ...[
                    DeliveryMapCard(
                      driverLat: state.driverLat,
                      driverLng: state.driverLng,
                      driverHeading: state.driverHeading,
                      restaurantLat: state.restaurantLat ?? order.restaurantLat,
                      restaurantLng: state.restaurantLng ?? order.restaurantLng,
                      deliveryLat: state.deliveryLat ?? order.deliveryLat,
                      deliveryLng: state.deliveryLng ?? order.deliveryLng,
                      estimatedEta: state.estimatedEta,
                      progress: state.trackingProgress,
                    ),
                    const SizedBox(height: 14),
                    const RiderContactCard(),
                    const SizedBox(height: 16),
                  ],

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

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'checkout_store.dart';
import 'widgets/widgets.dart';

class CheckoutView extends GetView<CheckoutStore> {
  const CheckoutView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Checkout',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Get.back(),
        ),
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Delivery Address Card
              const CheckoutAddressCard(),
              const SizedBox(height: 16),

              // 2. Delivery Timing & Scheduling
              const CheckoutDeliveryTimeCard(),
              const SizedBox(height: 16),

              // 3. Payment Method Selector
              const CheckoutPaymentSelector(),
              const SizedBox(height: 16),

              // 3. Order Items Preview
              const CheckoutOrderSummaryCard(),
              const SizedBox(height: 16),

              // 4. Kitchen Notes & Cutlery
              const CheckoutPreferencesCard(),
              const SizedBox(height: 16),

              // 5. Tip Your Rider
              const CheckoutTipCard(),
              const SizedBox(height: 16),

              // 6. Promo Code & Vouchers
              const CheckoutVoucherCard(),
              const SizedBox(height: 16),

              // 7. Bill Breakdown
              const CheckoutBillBreakdown(),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const CheckoutBottomBar(),
    );
  }
}

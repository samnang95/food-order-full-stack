import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'food_detail_store.dart';
import 'widgets/widgets.dart';

class FoodDetailView extends GetView<FoodDetailStore> {
  const FoodDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceBg = isDark ? const Color(0xFF121826) : const Color(0xFFF9FAFB);

    return Scaffold(
      backgroundColor: surfaceBg,
      body: const CustomScrollView(
        physics: BouncingScrollPhysics(),
        slivers: [
          // Image Header with Hero animation & top action buttons
          FoodDetailHeader(),

          // Main Food Content
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title, Category & Price
                  FoodDetailTitlePrice(),
                  SizedBox(height: 16),

                  // Quick Specs (Rating, Prep Time, Delivery)
                  FoodDetailSpecsCard(),
                  SizedBox(height: 24),

                  // Description
                  FoodDetailDescription(),
                  SizedBox(height: 28),

                  // Portion / Quantity Counter
                  FoodDetailQuantityCard(),
                  SizedBox(height: 24),

                  // Special Instructions / Kitchen Note
                  FoodDetailSpecialInstructions(),
                  SizedBox(height: 120), // Bottom clearance for sticky bar
                ],
              ),
            ),
          ),
        ],
      ),

      // Bottom Sticky Cart Action Bar
      bottomNavigationBar: const FoodDetailBottomBar(),
    );
  }
}

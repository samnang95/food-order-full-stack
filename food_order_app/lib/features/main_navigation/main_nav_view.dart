import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/widgets/floating_cart_bar.dart';
import '../categories/categories_view.dart';
import '../home/home_view.dart';
import '../orders/orders_view.dart';
import '../profile/profile_view.dart';
import 'main_nav_intent.dart';
import 'main_nav_store.dart';
import 'widgets/custom_bottom_nav_bar.dart';

class MainNavView extends GetView<MainNavStore> {
  const MainNavView({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final currentIndex = controller.state.value.currentIndex;

      return Scaffold(
        body: Stack(
          children: [
            IndexedStack(
              index: currentIndex,
              children: const [
                HomeView(),
                CategoriesView(),
                OrdersView(),
                ProfileView(),
              ],
            ),
            const Positioned(
              left: 0,
              right: 0,
              bottom: 8,
              child: FloatingCartBar(),
            ),
          ],
        ),
        bottomNavigationBar: CustomBottomNavBar(
          currentIndex: currentIndex,
          onTap: (index) {
            controller.onIntent(ChangeTabIntent(index));
          },
        ),
      );
    });
  }
}

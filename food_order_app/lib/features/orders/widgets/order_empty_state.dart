import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/translation_helper.dart';
import '../../main_navigation/main_nav_intent.dart';
import '../../main_navigation/main_nav_store.dart';

class OrderEmptyState extends StatelessWidget {
  final int selectedFilter;

  const OrderEmptyState({
    super.key,
    this.selectedFilter = 0,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final String title;
    final String subtitle;

    switch (selectedFilter) {
      case 1:
        title = 'No Active Orders';
        subtitle = 'You do not have any ongoing food deliveries right now.';
        break;
      case 2:
        title = 'No Completed Orders';
        subtitle = 'Your past completed food orders will appear here.';
        break;
      case 3:
        title = 'No Cancelled Orders';
        subtitle = 'You have not cancelled any orders.';
        break;
      default:
        title = 'noOrdersYet'.trOr(context, 'No orders yet');
        subtitle = 'noOrdersDesc'.trOr(
          context,
          'Explore delicious dishes and place your first order!',
        );
    }

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 80.0),
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.receipt_long_rounded,
                size: 44,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13.5,
                height: 1.35,
                color: isDark ? Colors.white60 : AppColors.subtitleColor,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                if (Get.isRegistered<MainNavStore>()) {
                  Get.find<MainNavStore>().onIntent(const ChangeTabIntent(0));
                }
              },
              icon: const Icon(Icons.restaurant_menu_rounded, size: 18),
              label: Text(
                'startOrdering'.trOr(context, 'Explore Menu'),
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
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

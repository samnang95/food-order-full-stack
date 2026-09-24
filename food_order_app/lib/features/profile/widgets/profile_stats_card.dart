import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../../main_navigation/main_nav_intent.dart';
import '../../main_navigation/main_nav_store.dart';
import '../profile_state.dart';

class ProfileStatsCard extends StatelessWidget {
  final ProfileState state;
  final bool isDark;
  final Color cardBg;

  const ProfileStatsCard({
    super.key,
    required this.state,
    required this.isDark,
    required this.cardBg,
  });

  @override
  Widget build(BuildContext context) {
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // Orders Stat (clickable to switch to Orders tab)
          InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () {
              if (Get.isRegistered<MainNavStore>()) {
                Get.find<MainNavStore>().onIntent(const ChangeTabIntent(2));
              }
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: _buildItem(
                context,
                value: '${state.ordersCount}',
                label: 'orders'.getString(context).isNotEmpty
                    ? 'orders'.getString(context)
                    : 'Orders',
                icon: Icons.receipt_long_rounded,
                iconColor: const Color(0xFF3B82F6),
              ),
            ),
          ),
          _buildDivider(borderColor),

          // Points Stat
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: _buildItem(
              context,
              value: '${state.points}',
              label: 'points'.getString(context).isNotEmpty
                  ? 'points'.getString(context)
                  : 'Points',
              icon: Icons.stars_rounded,
              iconColor: const Color(0xFFF59E0B),
            ),
          ),
          _buildDivider(borderColor),

          // Favorites Stat
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: _buildItem(
              context,
              value: '${state.favoritesCount}',
              label: 'favorites'.getString(context).isNotEmpty
                  ? 'favorites'.getString(context)
                  : 'Favorites',
              icon: Icons.favorite_rounded,
              iconColor: const Color(0xFFEF4444),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItem(
    BuildContext context, {
    required String value,
    required String label,
    required IconData icon,
    required Color iconColor,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.12),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 20, color: iconColor),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w900,
            color: isDark ? Colors.white : AppColors.neutral,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: isDark ? Colors.white60 : AppColors.subtitleColor,
          ),
        ),
      ],
    );
  }

  Widget _buildDivider(Color borderColor) {
    return Container(
      width: 1,
      height: 36,
      color: borderColor,
    );
  }
}

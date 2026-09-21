import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';

class CustomBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const CustomBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Exact colors from design mock:
    // Active: Warm terracotta / burnt orange
    // Inactive: Earthy dark mocha / charcoal brown
    final activeColor = isDark ? const Color(0xFFFF8A50) : const Color(0xFFB44B15);
    final inactiveColor = isDark ? const Color(0xFF9E9E9E) : const Color(0xFF55433C);
    final backgroundColor = isDark ? const Color(0xFF1E2638) : Colors.white;
    final topBorderColor = isDark ? const Color(0xFF2A364F) : const Color(0xFFECE5E0);

    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        border: Border(
          top: BorderSide(
            color: topBorderColor,
            width: 1.0,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                index: 0,
                isSelected: currentIndex == 0,
                icon: Icons.restaurant_rounded,
                label: 'navExplore'.getString(context),
                fallbackLabel: 'Explore',
                activeColor: activeColor,
                inactiveColor: inactiveColor,
                onTap: () => onTap(0),
              ),
              _NavItem(
                index: 1,
                isSelected: currentIndex == 1,
                icon: Icons.grid_view_rounded,
                label: 'navCategories'.getString(context),
                fallbackLabel: 'Categories',
                activeColor: activeColor,
                inactiveColor: inactiveColor,
                onTap: () => onTap(1),
              ),
              _NavItem(
                index: 2,
                isSelected: currentIndex == 2,
                icon: Icons.receipt_long_rounded,
                label: 'navOrders'.getString(context),
                fallbackLabel: 'Orders',
                activeColor: activeColor,
                inactiveColor: inactiveColor,
                onTap: () => onTap(2),
              ),
              _NavItem(
                index: 3,
                isSelected: currentIndex == 3,
                icon: Icons.person_outline_rounded,
                label: 'navProfile'.getString(context),
                fallbackLabel: 'Profile',
                activeColor: activeColor,
                inactiveColor: inactiveColor,
                onTap: () => onTap(3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final int index;
  final bool isSelected;
  final IconData icon;
  final String label;
  final String fallbackLabel;
  final Color activeColor;
  final Color inactiveColor;
  final VoidCallback onTap;

  const _NavItem({
    required this.index,
    required this.isSelected,
    required this.icon,
    required this.label,
    required this.fallbackLabel,
    required this.activeColor,
    required this.inactiveColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final displayLabel = label.isNotEmpty ? label : fallbackLabel;
    final color = isSelected ? activeColor : inactiveColor;

    return Expanded(
      child: GestureDetector(
        key: Key('nav_item_$index'),
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedScale(
                scale: isSelected ? 1.08 : 1.0,
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeOutBack,
                child: Icon(
                  icon,
                  size: 26,
                  color: color,
                ),
              ),
              const SizedBox(height: 4),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  fontFamily: Theme.of(context).textTheme.bodySmall?.fontFamily,
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  color: color,
                  letterSpacing: -0.1,
                ),
                child: Text(
                  displayLabel,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/locale/translation_helper.dart';
import '../../../routes/app_routes.dart';
import '../models/notification_item_model.dart';
import '../notification_store.dart';

class NotificationBottomSheet extends StatelessWidget {
  const NotificationBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.78,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF141A29) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.15),
              blurRadius: 24,
              offset: const Offset(0, -6),
            ),
          ],
        ),
        child: const NotificationBottomSheet(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final store = Get.isRegistered<NotificationStore>()
        ? Get.find<NotificationStore>()
        : Get.put(NotificationStore());

    return Column(
      children: [
        // 1. Drag Handle
        Container(
          width: 44,
          height: 4,
          margin: const EdgeInsets.only(top: 12, bottom: 8),
          decoration: BoxDecoration(
            color: isDark ? Colors.white24 : const Color(0xFFCBD5E1),
            borderRadius: BorderRadius.circular(2),
          ),
        ),

        // 2. Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.notifications_active_rounded,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'notificationsTitle'.trOr(context, 'Notifications'),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 8),
              Obx(() {
                final unread = store.unreadCount;
                if (unread == 0) return const SizedBox.shrink();
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$unread',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                );
              }),
              const Spacer(),
              // Mark all read button
              IconButton(
                icon: const Icon(Icons.done_all_rounded, size: 22),
                tooltip: 'markAllAsRead'.trOr(context, 'Mark all as read'),
                onPressed: () {
                  store.markAllAsRead();
                  Get.snackbar(
                    'Done',
                    'allNotificationsRead'.trOr(context, 'All notifications marked as read'),
                    backgroundColor: const Color(0xFF10B981),
                    colorText: Colors.white,
                    snackPosition: SnackPosition.BOTTOM,
                    duration: const Duration(seconds: 2),
                    margin: const EdgeInsets.all(16),
                    borderRadius: 12,
                  );
                },
              ),
              // Open full page button
              IconButton(
                icon: const Icon(Icons.open_in_full_rounded, size: 19),
                tooltip: 'Open Full Page',
                onPressed: () {
                  Navigator.of(context).pop();
                  Get.toNamed(AppRoutes.notifications);
                },
              ),
            ],
          ),
        ),

        const Divider(height: 1),

        // 3. Filter chips
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Obx(() {
            final current = store.selectedTab.value;
            return Row(
              children: [
                _buildFilterChip(
                  context,
                  label: 'all'.trOr(context, 'All'),
                  count: store.notifications.length,
                  isSelected: current == 'all',
                  onTap: () => store.setTab('all'),
                  isDark: isDark,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  context,
                  label: 'ordersTab'.trOr(context, 'Orders'),
                  count: store.ordersCount,
                  isSelected: current == 'order',
                  onTap: () => store.setTab('order'),
                  isDark: isDark,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  context,
                  label: 'promosTab'.trOr(context, 'Promotions'),
                  count: store.promosCount,
                  isSelected: current == 'promo',
                  onTap: () => store.setTab('promo'),
                  isDark: isDark,
                ),
              ],
            );
          }),
        ),

        // 4. Notification list
        Expanded(
          child: Obx(() {
            final list = store.filteredNotifications;
            if (list.isEmpty) {
              return _buildEmptyState(context, store.selectedTab.value, isDark);
            }

            return ListView.separated(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
              itemCount: list.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = list[index];
                return _buildSheetItem(context, store, item, isDark);
              },
            );
          }),
        ),

        // 5. Bottom Action: View all in full page
        Container(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF141A29) : Colors.white,
            border: Border(
              top: BorderSide(
                color: isDark ? const Color(0xFF263248) : const Color(0xFFF1F5F9),
              ),
            ),
          ),
          child: SafeArea(
            top: false,
            child: SizedBox(
              width: double.infinity,
              height: 44,
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.of(context).pop();
                  Get.toNamed(AppRoutes.notifications);
                },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppColors.primary.withValues(alpha: 0.5)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.mark_email_read_outlined, size: 18, color: AppColors.primary),
                label: const Text(
                  'Manage All Notifications',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 13.5,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip(
    BuildContext context, {
    required String label,
    required int count,
    required bool isSelected,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : (isDark ? const Color(0xFF1E2638) : const Color(0xFFF8FAFC)),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected
                    ? Colors.white
                    : (isDark ? Colors.white70 : const Color(0xFF475569)),
              ),
            ),
            if (count > 0) ...[
              const SizedBox(width: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.white.withValues(alpha: 0.25)
                      : (isDark ? Colors.white12 : const Color(0xFFE2E8F0)),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$count',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isSelected
                        ? Colors.white
                        : (isDark ? Colors.white70 : const Color(0xFF64748B)),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSheetItem(
    BuildContext context,
    NotificationStore store,
    NotificationItemModel item,
    bool isDark,
  ) {
    Color iconBg;
    Color iconColor;
    IconData iconData;

    switch (item.type) {
      case 'delivery':
        iconBg = const Color(0xFF10B981).withValues(alpha: 0.12);
        iconColor = const Color(0xFF10B981);
        iconData = Icons.check_circle_rounded;
        break;
      case 'order':
        iconBg = AppColors.primary.withValues(alpha: 0.12);
        iconColor = AppColors.primary;
        iconData = Icons.delivery_dining_rounded;
        break;
      case 'promo':
        iconBg = const Color(0xFF8B5CF6).withValues(alpha: 0.12);
        iconColor = const Color(0xFF8B5CF6);
        iconData = Icons.local_offer_rounded;
        break;
      default:
        iconBg = const Color(0xFF3B82F6).withValues(alpha: 0.12);
        iconColor = const Color(0xFF3B82F6);
        iconData = Icons.notifications_active_rounded;
    }

    final cardBg = isDark
        ? (item.isRead ? const Color(0xFF192132) : const Color(0xFF1E283E))
        : (item.isRead ? Colors.white : const Color(0xFFF9FBFF));

    final borderColor = isDark
        ? (item.isRead ? const Color(0xFF263248) : AppColors.primary.withValues(alpha: 0.35))
        : (item.isRead ? const Color(0xFFEBF0F5) : AppColors.primary.withValues(alpha: 0.3));

    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () {
        if (!item.isRead) {
          store.markAsRead(item.id);
        }
        Navigator.of(context).pop();

        if (item.orderId != null && item.orderId!.isNotEmpty) {
          Get.toNamed(AppRoutes.orderDetail, arguments: item.orderId);
        } else if (item.promoCode != null && item.promoCode!.isNotEmpty) {
          Clipboard.setData(ClipboardData(text: item.promoCode!));
          Get.snackbar(
            'Code Copied!',
            'Promo code ${item.promoCode} copied to clipboard',
            backgroundColor: const Color(0xFF10B981),
            colorText: Colors.white,
            snackPosition: SnackPosition.TOP,
            duration: const Duration(seconds: 2),
          );
        }
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor, width: item.isRead ? 1.0 : 1.2),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(iconData, color: iconColor, size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          style: TextStyle(
                            fontSize: 13.5,
                            fontWeight: item.isRead ? FontWeight.w600 : FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (!item.isRead)
                        Container(
                          width: 7,
                          height: 7,
                          margin: const EdgeInsets.only(left: 6),
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.body,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? Colors.white70 : const Color(0xFF64748B),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.timeAgo,
                    style: TextStyle(
                      fontSize: 10.5,
                      color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, String tab, bool isDark) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_none_rounded,
              size: 40,
              color: isDark ? Colors.white30 : const Color(0xFF94A3B8),
            ),
            const SizedBox(height: 12),
            Text(
              'noNotifications'.trOr(context, 'No Notifications Yet'),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            const SizedBox(height: 6),
            Text(
              'noNotificationsDesc'.trOr(context, 'You will receive order updates, promotions, and delivery news here.'),
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: isDark ? Colors.white54 : const Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

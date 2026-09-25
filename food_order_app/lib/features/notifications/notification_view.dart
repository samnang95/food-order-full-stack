import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../core/constants/app_colors.dart';
import '../../core/locale/translation_helper.dart';
import '../../routes/app_routes.dart';
import 'models/notification_item_model.dart';
import 'notification_store.dart';

class NotificationView extends GetView<NotificationStore> {
  const NotificationView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final store = controller;
    final isScrolled = ValueNotifier<bool>(false);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Text(
              'notificationsTitle'.trOr(context, 'Notifications'),
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
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
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Get.back(),
        ),
        actions: [
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
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            onSelected: (value) {
              if (value == 'clear') {
                store.clearAll();
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'clear',
                child: Row(
                  children: [
                    const Icon(Icons.delete_sweep_outlined, color: Color(0xFFEF4444), size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'clearAll'.trOr(context, 'Clear all notifications'),
                      style: const TextStyle(color: Color(0xFFEF4444), fontSize: 13.5),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Filter Tabs Bar with subtle shadow when scrolling
            ValueListenableBuilder<bool>(
              valueListenable: isScrolled,
              builder: (context, scrolled, child) {
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF141A29) : Colors.white,
                    border: Border(
                      bottom: BorderSide(
                        color: scrolled
                            ? Colors.transparent
                            : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFF1F5F9)),
                      ),
                    ),
                    boxShadow: scrolled
                        ? [
                            BoxShadow(
                              color: isDark
                                  ? Colors.black.withValues(alpha: 0.35)
                                  : Colors.black.withValues(alpha: 0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ]
                        : [],
                  ),
                  child: child,
                );
              },
              child: _buildFilterBar(context, store, isDark),
            ),

            // Notification List
            Expanded(
              child: Obx(() {
                final list = store.filteredNotifications;

                if (list.isEmpty) {
                  return _buildEmptyState(context, store.selectedTab.value, isDark);
                }

                return NotificationListener<ScrollNotification>(
                  onNotification: (scrollInfo) {
                    isScrolled.value = scrollInfo.metrics.pixels > 5;
                    return false;
                  },
                  child: RefreshIndicator(
                    onRefresh: () => store.loadNotifications(),
                    color: AppColors.primary,
                    child: ListView.separated(
                      physics: const AlwaysScrollableScrollPhysics(
                        parent: BouncingScrollPhysics(),
                      ),
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
                      itemCount: list.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final item = list[index];
                        return _buildNotificationCard(context, store, item, isDark);
                      },
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterBar(BuildContext context, NotificationStore store, bool isDark) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF141A29) : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFF1F5F9),
          ),
        ),
      ),
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
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
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
                fontSize: 12.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected
                    ? Colors.white
                    : (isDark ? Colors.white70 : const Color(0xFF475569)),
              ),
            ),
            if (count > 0) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.white.withValues(alpha: 0.25)
                      : (isDark ? Colors.white12 : const Color(0xFFE2E8F0)),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$count',
                  style: TextStyle(
                    fontSize: 10.5,
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

  Widget _buildNotificationCard(
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

    return Dismissible(
      key: Key(item.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) {
        store.deleteNotification(item.id);
      },
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: const Color(0xFFEF4444),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete_outline_rounded, color: Colors.white, size: 24),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          if (!item.isRead) {
            store.markAsRead(item.id);
          }

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
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: borderColor, width: item.isRead ? 1.0 : 1.3),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon Badge
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(iconData, color: iconColor, size: 22),
              ),
              const SizedBox(width: 12),

              // Text Content
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
                              fontSize: 14,
                              fontWeight: item.isRead ? FontWeight.w600 : FontWeight.bold,
                              color: isDark ? Colors.white : AppColors.neutral,
                            ),
                          ),
                        ),
                        if (!item.isRead)
                          Container(
                            width: 8,
                            height: 8,
                            margin: const EdgeInsets.only(left: 6),
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.body,
                      style: TextStyle(
                        fontSize: 12.5,
                        color: isDark ? Colors.white70 : const Color(0xFF64748B),
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Actions & Time Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          item.timeAgo,
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (item.promoCode != null)
                          GestureDetector(
                            onTap: () {
                              Clipboard.setData(ClipboardData(text: item.promoCode!));
                              Get.snackbar(
                                'Code Copied!',
                                'Code "${item.promoCode}" copied to clipboard',
                                backgroundColor: const Color(0xFF10B981),
                                colorText: Colors.white,
                                snackPosition: SnackPosition.TOP,
                                duration: const Duration(seconds: 2),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFF8B5CF6).withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.3),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.copy_rounded, size: 11, color: Color(0xFF8B5CF6)),
                                  const SizedBox(width: 4),
                                  Text(
                                    item.promoCode!,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF8B5CF6),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else if (item.orderId != null)
                          GestureDetector(
                            onTap: () {
                              Get.toNamed(AppRoutes.orderDetail, arguments: item.orderId);
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'trackOrder'.trOr(context, 'Track Order'),
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  const SizedBox(width: 3),
                                  const Icon(Icons.arrow_forward_ios_rounded,
                                      size: 10, color: AppColors.primary),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, String tab, bool isDark) {
    String title;
    String subtitle;
    IconData icon;

    switch (tab) {
      case 'order':
        title = 'noOrderNotifs'.trOr(context, 'No Order Updates');
        subtitle = 'noOrderNotifsDesc'.trOr(context, 'Updates about your active deliveries will appear here.');
        icon = Icons.delivery_dining_outlined;
        break;
      case 'promo':
        title = 'noPromoNotifs'.trOr(context, 'No Active Promos');
        subtitle = 'noPromoNotifsDesc'.trOr(context, 'Special discount codes and celebrations will drop here.');
        icon = Icons.local_offer_outlined;
        break;
      default:
        title = 'noNotifications'.trOr(context, 'No Notifications Yet');
        subtitle = 'noNotificationsDesc'.trOr(context, 'You will receive order updates, promotions, and delivery news here.');
        icon = Icons.notifications_none_rounded;
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E2638) : const Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 38,
                color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              title,
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : AppColors.neutral,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white54 : const Color(0xFF64748B),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

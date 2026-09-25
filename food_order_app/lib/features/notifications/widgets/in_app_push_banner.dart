import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../core/constants/app_colors.dart';
import '../../../routes/app_routes.dart';
import '../models/notification_item_model.dart';
import '../notification_store.dart';

class InAppPushBanner extends StatelessWidget {
  final NotificationItemModel notification;
  final VoidCallback onDismiss;

  const InAppPushBanner({
    super.key,
    required this.notification,
    required this.onDismiss,
  });

  static void show(NotificationItemModel notification) {
    // Only display if context/overlay is active
    if (Get.context == null) return;

    Get.rawSnackbar(
      snackPosition: SnackPosition.TOP,
      backgroundColor: Colors.transparent,
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      padding: EdgeInsets.zero,
      duration: const Duration(seconds: 4),
      messageText: InAppPushBanner(
        notification: notification,
        onDismiss: () {
          if (Get.isSnackbarOpen) {
            Get.closeCurrentSnackbar();
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color iconBg;
    Color iconColor;
    IconData iconData;

    switch (notification.type) {
      case 'delivery':
        iconBg = const Color(0xFF10B981).withValues(alpha: 0.15);
        iconColor = const Color(0xFF10B981);
        iconData = Icons.check_circle_rounded;
        break;
      case 'order':
        iconBg = AppColors.primary.withValues(alpha: 0.15);
        iconColor = AppColors.primary;
        iconData = Icons.delivery_dining_rounded;
        break;
      case 'promo':
        iconBg = const Color(0xFF8B5CF6).withValues(alpha: 0.15);
        iconColor = const Color(0xFF8B5CF6);
        iconData = Icons.local_offer_rounded;
        break;
      default:
        iconBg = const Color(0xFF3B82F6).withValues(alpha: 0.15);
        iconColor = const Color(0xFF3B82F6);
        iconData = Icons.notifications_active_rounded;
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () {
          onDismiss();
          if (Get.isRegistered<NotificationStore>()) {
            Get.find<NotificationStore>().markAsRead(notification.id);
          }

          if (notification.orderId != null && notification.orderId!.isNotEmpty) {
            Get.toNamed(AppRoutes.orderDetail, arguments: notification.orderId);
          } else if (notification.promoCode != null && notification.promoCode!.isNotEmpty) {
            Clipboard.setData(ClipboardData(text: notification.promoCode!));
            Get.snackbar(
              'Code Copied!',
              'Promo code ${notification.promoCode} copied to clipboard',
              backgroundColor: const Color(0xFF10B981),
              colorText: Colors.white,
              snackPosition: SnackPosition.TOP,
              duration: const Duration(seconds: 2),
            );
          } else {
            Get.toNamed(AppRoutes.notifications);
          }
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E2638) : Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.12),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Icon container
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(iconData, color: iconColor, size: 22),
              ),
              const SizedBox(width: 12),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            style: TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : AppColors.neutral,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: iconColor.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'NOW',
                            style: TextStyle(
                              fontSize: 9.5,
                              fontWeight: FontWeight.w800,
                              color: iconColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      notification.body,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white70 : const Color(0xFF64748B),
                        height: 1.25,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Dismiss button
              GestureDetector(
                onTap: onDismiss,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.close_rounded,
                    size: 16,
                    color: isDark ? Colors.white60 : Colors.black45,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

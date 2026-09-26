import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../../core/db/local_db.dart';
import '../../core/services/api_client.dart';
import '../../core/services/local_notification_service.dart';
import '../../core/services/socket_service.dart';
import 'models/notification_item_model.dart';
import 'widgets/in_app_push_banner.dart';

class NotificationStore extends GetxController {
  static NotificationStore get instance => Get.find<NotificationStore>();

  static const String _storageKey = 'app_notifications';

  final notifications = <NotificationItemModel>[].obs;
  final selectedTab = 'all'.obs; // 'all', 'order', 'promo'
  final isLoading = false.obs;

  int get unreadCount => notifications.where((n) => !n.isRead).length;

  int get ordersCount =>
      notifications.where((n) => n.type == 'order' || n.type == 'delivery').length;

  int get promosCount => notifications.where((n) => n.type == 'promo').length;

  List<NotificationItemModel> get filteredNotifications {
    switch (selectedTab.value) {
      case 'order':
        return notifications
            .where((n) => n.type == 'order' || n.type == 'delivery')
            .toList();
      case 'promo':
        return notifications.where((n) => n.type == 'promo').toList();
      default:
        return notifications.toList();
    }
  }

  @override
  void onInit() {
    super.onInit();
    loadNotifications();
    _setupSocketListener();
  }

  void _setupSocketListener() {
    SocketService.instance.onPushNotification((data) {
      try {
        final notif = NotificationItemModel.fromJson(data);
        // Avoid duplicate by ID
        if (!notifications.any((n) => n.id == notif.id)) {
          addNotification(notif, showBanner: true);
        }
      } catch (e) {
        debugPrint('⚠️ [NotificationStore] Error parsing socket notification: $e');
      }
    });

    SocketService.instance.onOrderStatusChanged((data) {
      try {
        final orderId = data['orderId']?.toString() ?? '';
        final status = data['status']?.toString() ?? '';
        handleOrderStatusUpdate(orderId: orderId, status: status);
      } catch (e) {
        debugPrint('⚠️ [NotificationStore] Error handling socket order status: $e');
      }
    });
  }

  /// Automatically generate a push notification when an order status advances
  void handleOrderStatusUpdate({required String orderId, required String status}) {
    if (orderId.isEmpty || status.isEmpty) return;

    final notifId = 'status_${orderId}_$status';
    if (notifications.any((n) => n.id == notifId)) return;

    final shortId = orderId.length > 6
        ? orderId.substring(orderId.length - 6).toUpperCase()
        : orderId;

    String title;
    String body;

    switch (status.toLowerCase()) {
      case 'confirmed':
        title = '✅ Order #$shortId Confirmed!';
        body = 'The restaurant has accepted your order and will start cooking soon.';
        break;
      case 'preparing':
        title = '🍳 Order #$shortId Being Prepared';
        body = 'Chef is now preparing your delicious meal with fresh ingredients.';
        break;
      case 'on_the_way':
        title = '🛵 Order #$shortId Out for Delivery!';
        body = 'Our delivery partner is on the way with your food.';
        break;
      case 'delivered':
        title = '🎉 Order #$shortId Delivered!';
        body = 'Your meal has arrived! Enjoy your food and have a great day.';
        break;
      case 'cancelled':
        title = '❌ Order #$shortId Cancelled';
        body = 'Your order has been cancelled and any paid funds have been refunded.';
        break;
      default:
        title = '📦 Order #$shortId Updated';
        body = 'Order status has been updated to $status.';
    }

    final notif = NotificationItemModel(
      id: notifId,
      type: 'order',
      title: title,
      body: body,
      orderId: orderId,
      timestamp: DateTime.now(),
      isRead: false,
    );

    addNotification(notif, showBanner: true);
  }

  Future<void> loadNotifications() async {
    isLoading.value = true;
    try {
      final cachedJson = LocalDB.getString(_storageKey);
      if (cachedJson != null && cachedJson.isNotEmpty) {
        final List<dynamic> list = jsonDecode(cachedJson);
        final loaded = list.map((item) => NotificationItemModel.fromJson(item)).toList();
        notifications.assignAll(loaded);
      } else {
        // Seed default notifications for new user
        _seedDefaultNotifications();
      }

      // Try fetching recent system announcements from backend
      await _fetchBackendNotifications();
    } catch (e) {
      debugPrint('⚠️ [NotificationStore] Error loading notifications: $e');
      if (notifications.isEmpty) {
        _seedDefaultNotifications();
      }
    } finally {
      isLoading.value = false;
    }
  }

  void _seedDefaultNotifications() {
    final now = DateTime.now();
    final seeds = [
      NotificationItemModel(
        id: 'promo_welcome10',
        type: 'promo',
        title: '🎁 Welcome to BiteCraft!',
        body: 'Enjoy 10% off your entire first meal with promo code WELCOME10 at checkout.',
        promoCode: 'WELCOME10',
        timestamp: now.subtract(const Duration(minutes: 15)),
        isRead: false,
      ),
      NotificationItemModel(
        id: 'promo_freeship',
        type: 'promo',
        title: '🚚 Free Delivery Available',
        body: 'Save \$1.50 on delivery for orders over \$8 with coupon code FREESHIP.',
        promoCode: 'FREESHIP',
        timestamp: now.subtract(const Duration(hours: 3)),
        isRead: false,
      ),
      NotificationItemModel(
        id: 'promo_khnewyear',
        type: 'promo',
        title: '🎊 Khmer New Year Special!',
        body: 'Celebration discount: 15% OFF with coupon code KHNEWYEAR on any delicious meal.',
        promoCode: 'KHNEWYEAR',
        timestamp: now.subtract(const Duration(days: 1)),
        isRead: true,
      ),
    ];
    notifications.assignAll(seeds);
    _saveToLocal();
  }

  Future<void> _fetchBackendNotifications() async {
    try {
      final res = await ApiClient.get('/notifications');
      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);
        if (json['status'] == 'success' && json['data'] != null) {
          final List<dynamic> data = json['data'];
          bool hasNew = false;
          for (final item in data) {
            final notif = NotificationItemModel.fromJson(item);
            if (!notifications.any((n) => n.id == notif.id)) {
              notifications.add(notif);
              hasNew = true;
            }
          }
          if (hasNew) {
            notifications.sort((a, b) => b.timestamp.compareTo(a.timestamp));
            _saveToLocal();
          }
        }
      }
    } catch (_) {
      // Backend may be offline in test or no network; ignore gracefully
    }
  }

  void addNotification(NotificationItemModel item, {bool showBanner = true}) {
    notifications.insert(0, item);
    _saveToLocal();

    // Post real native OS notification on iOS & Android system tray / lock screen
    LocalNotificationService.instance.showNativeNotification(
      id: item.id.hashCode.abs(),
      title: item.title,
      body: item.body,
      payload: item.orderId != null ? 'order_${item.orderId}' : item.promoCode,
      type: item.type,
    );

    if (showBanner) {
      InAppPushBanner.show(item);
    }
  }

  void markAsRead(String id) {
    final index = notifications.indexWhere((n) => n.id == id);
    if (index != -1) {
      notifications[index] = notifications[index].copyWith(isRead: true);
      _saveToLocal();
    }
  }

  void markAllAsRead() {
    for (int i = 0; i < notifications.length; i++) {
      if (!notifications[i].isRead) {
        notifications[i] = notifications[i].copyWith(isRead: true);
      }
    }
    _saveToLocal();
  }

  void deleteNotification(String id) {
    notifications.removeWhere((n) => n.id == id);
    _saveToLocal();
  }

  void clearAll() {
    notifications.clear();
    _saveToLocal();
  }

  void setTab(String tab) {
    selectedTab.value = tab;
  }

  void _saveToLocal() {
    try {
      final jsonList = notifications.map((n) => n.toJson()).toList();
      LocalDB.setString(_storageKey, jsonEncode(jsonList));
    } catch (e) {
      debugPrint('⚠️ [NotificationStore] Error saving notifications to LocalDB: $e');
    }
  }
}

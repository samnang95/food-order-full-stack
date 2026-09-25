import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:food_order_app/core/db/local_db.dart';
import 'package:food_order_app/features/notifications/models/notification_item_model.dart';
import 'package:food_order_app/features/notifications/notification_store.dart';
import 'package:food_order_app/features/notifications/notification_view.dart';

void main() {
  late NotificationStore store;

  setUp(() async {
    Get.testMode = true;
    SharedPreferences.setMockInitialValues({});
    await LocalDB.init();

    store = Get.put(NotificationStore());
  });

  tearDown(() {
    Get.reset();
  });

  group('NotificationItemModel Tests', () {
    test('toJson and fromJson serialize accurately', () {
      final now = DateTime(2026, 9, 25, 12, 0);
      final model = NotificationItemModel(
        id: 'test_1',
        title: 'Special Offer',
        body: 'Get 20% discount',
        type: 'promo',
        timestamp: now,
        isRead: false,
        promoCode: 'SUPER20',
        orderId: 'ord_123',
      );

      final json = model.toJson();
      final revived = NotificationItemModel.fromJson(json);

      expect(revived.id, 'test_1');
      expect(revived.title, 'Special Offer');
      expect(revived.body, 'Get 20% discount');
      expect(revived.type, 'promo');
      expect(revived.isRead, false);
      expect(revived.promoCode, 'SUPER20');
      expect(revived.orderId, 'ord_123');
    });

    test('timeAgo returns formatted relative time', () {
      final now = DateTime.now();

      final justNow = NotificationItemModel(
        id: '1',
        title: 'T',
        body: 'B',
        timestamp: now.subtract(const Duration(seconds: 15)),
      );
      expect(justNow.timeAgo, 'Just now');

      final minsAgo = NotificationItemModel(
        id: '2',
        title: 'T',
        body: 'B',
        timestamp: now.subtract(const Duration(minutes: 10)),
      );
      expect(minsAgo.timeAgo, '10m ago');

      final hoursAgo = NotificationItemModel(
        id: '3',
        title: 'T',
        body: 'B',
        timestamp: now.subtract(const Duration(hours: 4)),
      );
      expect(hoursAgo.timeAgo, '4h ago');
    });
  });

  group('NotificationStore Unit Tests', () {
    test('Seeds default notifications on clean initialization', () {
      expect(store.notifications.isNotEmpty, true);
      expect(store.unreadCount, greaterThan(0));
      expect(store.selectedTab.value, 'all');
    });

    test('addNotification adds to top and updates unread count', () {
      final initialCount = store.notifications.length;
      final initialUnread = store.unreadCount;

      final newNotif = NotificationItemModel(
        id: 'new_order_1',
        title: 'Order Confirmed',
        body: 'Preparing your meal',
        type: 'order',
        timestamp: DateTime.now(),
        isRead: false,
        orderId: 'ord_999',
      );

      store.addNotification(newNotif, showBanner: false);

      expect(store.notifications.length, initialCount + 1);
      expect(store.notifications.first.id, 'new_order_1');
      expect(store.unreadCount, initialUnread + 1);
    });

    test('markAsRead marks specific item as read and updates count', () {
      final unreadItem = store.notifications.firstWhere((n) => !n.isRead);
      final beforeUnread = store.unreadCount;

      store.markAsRead(unreadItem.id);

      final updatedItem = store.notifications.firstWhere((n) => n.id == unreadItem.id);
      expect(updatedItem.isRead, true);
      expect(store.unreadCount, beforeUnread - 1);
    });

    test('markAllAsRead marks all notifications as read', () {
      expect(store.unreadCount, greaterThan(0));

      store.markAllAsRead();

      expect(store.unreadCount, 0);
      expect(store.notifications.every((n) => n.isRead), true);
    });

    test('deleteNotification removes item from list', () {
      final targetId = store.notifications.first.id;
      final initialCount = store.notifications.length;

      store.deleteNotification(targetId);

      expect(store.notifications.length, initialCount - 1);
      expect(store.notifications.any((n) => n.id == targetId), false);
    });

    test('clearAll clears all notifications', () {
      store.clearAll();

      expect(store.notifications.isEmpty, true);
      expect(store.unreadCount, 0);
    });

    test('Tab filtering filters items by order and promo', () {
      // Add one order notification
      store.addNotification(
        NotificationItemModel(
          id: 'test_order',
          title: 'Order Test',
          body: 'Order Body',
          type: 'order',
          timestamp: DateTime.now(),
        ),
        showBanner: false,
      );

      // Check 'all' tab
      store.setTab('all');
      expect(store.filteredNotifications.length, store.notifications.length);

      // Check 'order' tab
      store.setTab('order');
      for (final n in store.filteredNotifications) {
        expect(n.type == 'order' || n.type == 'delivery', true);
      }

      // Check 'promo' tab
      store.setTab('promo');
      for (final n in store.filteredNotifications) {
        expect(n.type, 'promo');
      }
    });
  });

  group('NotificationView Widget Tests', () {
    testWidgets('NotificationView renders header, filter chips, and items', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: NotificationView(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Notifications'), findsOneWidget);
      expect(find.text('All'), findsOneWidget);
      expect(find.text('Orders'), findsOneWidget);
      expect(find.text('Promotions'), findsOneWidget);

      // Verify seed item titles
      expect(find.text('🎁 Welcome to BiteCraft!'), findsOneWidget);
      expect(find.text('🚚 Free Delivery Available'), findsOneWidget);
    });

    testWidgets('Tapping Promotions tab filters to promo items only', (tester) async {
      await tester.pumpWidget(
        const GetMaterialApp(
          home: NotificationView(),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Promotions'));
      await tester.pumpAndSettle();

      expect(store.selectedTab.value, 'promo');
      expect(find.text('🎁 Welcome to BiteCraft!'), findsOneWidget);
    });

    testWidgets('Empty state renders when list has no items', (tester) async {
      store.clearAll();

      await tester.pumpWidget(
        const GetMaterialApp(
          home: NotificationView(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('No Notifications Yet'), findsOneWidget);
    });
  });
}

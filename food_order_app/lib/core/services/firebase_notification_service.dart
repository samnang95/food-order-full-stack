import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import '../../features/notifications/models/notification_item_model.dart';
import '../../features/notifications/notification_store.dart';
import '../../firebase_options.dart';
import '../../routes/app_routes.dart';
import '../db/local_db.dart';

/// Top-level background message handler required by FlutterFire
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    debugPrint('🌙 [FirebaseNotificationService] Background message received: ${message.messageId}');
  } catch (e) {
    debugPrint('⚠️ [FirebaseNotificationService] Error in background message handler: $e');
  }
}

class FirebaseNotificationService {
  FirebaseNotificationService._();
  static final FirebaseNotificationService instance = FirebaseNotificationService._();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  bool _isInitialized = false;
  String? _fcmToken;

  bool get isInitialized => _isInitialized;
  String? get fcmToken => _fcmToken;

  /// Initialize Firebase Cloud Messaging listeners and permissions
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // 1. Request user permissions (required for iOS and Android 13+)
      final settings = await _messaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
      debugPrint('🔔 [FirebaseNotificationService] Permission status: ${settings.authorizationStatus}');

      // 2. Set iOS foreground presentation options
      await _messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // 3. Register top-level background message handler
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // 4. Retrieve FCM device registration token
      await _fetchAndStoreToken();

      // 5. Listen for token refreshes
      _messaging.onTokenRefresh.listen((newToken) {
        _fcmToken = newToken;
        debugPrint('🔥 [FirebaseNotificationService] FCM Token refreshed: $newToken');
        LocalDB.setString('fcm_token', newToken);
      });

      // 6. Listen to foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('📩 [FirebaseNotificationService] Foreground message received: ${message.notification?.title}');
        _handleIncomingMessage(message, isForeground: true);
      });

      // 7. Handle notification tap when app opened from background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('👆 [FirebaseNotificationService] App opened from background via notification: ${message.messageId}');
        _handleNotificationTap(message);
      });

      // 8. Handle notification tap when app opened from terminated state
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        try {
          final initialMessage = await _messaging.getInitialMessage();
          if (initialMessage != null) {
            debugPrint('👆 [FirebaseNotificationService] App launched from terminated via notification: ${initialMessage.messageId}');
            _handleNotificationTap(initialMessage);
          }
        } catch (e) {
          debugPrint('⚠️ [FirebaseNotificationService] Error checking initial message: $e');
        }
      });

      _isInitialized = true;
      debugPrint('✅ [FirebaseNotificationService] FCM service initialized successfully');
    } catch (e) {
      debugPrint('⚠️ [FirebaseNotificationService] Initialization error: $e');
    }
  }

  /// Retrieve FCM device registration token
  Future<String?> _fetchAndStoreToken() async {
    try {
      _fcmToken = await _messaging.getToken();
      if (_fcmToken != null) {
        debugPrint('\n======================================================');
        debugPrint('🔥 [FCM] Device Token: $_fcmToken');
        debugPrint('======================================================\n');
        await LocalDB.setString('fcm_token', _fcmToken!);
      }
      return _fcmToken;
    } catch (e) {
      debugPrint('⚠️ [FirebaseNotificationService] Could not retrieve FCM token: $e');
      return null;
    }
  }

  /// Process incoming RemoteMessage into NotificationItemModel and store/show
  void _handleIncomingMessage(RemoteMessage message, {bool isForeground = false}) {
    final title = message.notification?.title ?? message.data['title'] ?? 'BiteCraft Update';
    final body = message.notification?.body ?? message.data['body'] ?? '';
    final type = message.data['type'] ?? 'system';
    final orderId = message.data['orderId'] ?? message.data['order_id'];
    final promoCode = message.data['promoCode'] ?? message.data['promo_code'];

    final item = NotificationItemModel(
      id: message.messageId ?? 'fcm_${DateTime.now().millisecondsSinceEpoch}',
      title: title,
      body: body,
      type: type,
      timestamp: DateTime.now(),
      isRead: false,
      orderId: orderId?.toString(),
      promoCode: promoCode?.toString(),
    );

    if (Get.isRegistered<NotificationStore>()) {
      NotificationStore.instance.addNotification(item, showBanner: isForeground);
    }
  }

  /// Navigate user when notification is tapped
  void _handleNotificationTap(RemoteMessage message) {
    final orderId = message.data['orderId'] ?? message.data['order_id'];
    if (orderId != null && orderId.toString().isNotEmpty) {
      Get.toNamed(AppRoutes.orderDetail, arguments: orderId.toString());
      return;
    }

    Get.toNamed(AppRoutes.notifications);
  }
}

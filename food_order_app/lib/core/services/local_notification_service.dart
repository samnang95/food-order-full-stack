import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import '../../routes/app_routes.dart';

class LocalNotificationService {
  LocalNotificationService._();
  static final LocalNotificationService instance = LocalNotificationService._();

  final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();
  bool _isInitialized = false;

  bool get isInitialized => _isInitialized;

  static const String _orderChannelId = 'bitecraft_orders';
  static const String _orderChannelName = 'BiteCraft Orders & Delivery';
  static const String _orderChannelDesc = 'Real-time updates for your food orders and live delivery tracking';

  static const String _promoChannelId = 'bitecraft_promos';
  static const String _promoChannelName = 'BiteCraft Offers & Discounts';
  static const String _promoChannelDesc = 'Exclusive promo codes and special meal discounts';

  /// Initialize local notification service for Android & iOS
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');

      const darwinSettings = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );

      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: darwinSettings,
      );

      await _plugin.initialize(
        settings: initSettings,
        onDidReceiveNotificationResponse: _onNotificationTapped,
      );

      // Create Android Notification Channels (Android 8.0+)
      await _createNotificationChannels();

      // Request runtime permissions (Android 13+ & iOS)
      await requestPermissions();

      _isInitialized = true;
      debugPrint('🔔 [LocalNotificationService] Native notification service initialized successfully');
    } catch (e) {
      debugPrint('⚠️ [LocalNotificationService] Error initializing notifications: $e');
    }
  }

  /// Request runtime permissions for Android 13+ and iOS
  Future<void> requestPermissions() async {
    try {
      // Android 13+
      final androidImplementation = _plugin
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
      if (androidImplementation != null) {
        await androidImplementation.requestNotificationsPermission();
      }

      // iOS
      final iosImplementation = _plugin
          .resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>();
      if (iosImplementation != null) {
        await iosImplementation.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
      }
    } catch (e) {
      debugPrint('⚠️ [LocalNotificationService] Error requesting permissions: $e');
    }
  }

  /// Create notification channels for Android
  Future<void> _createNotificationChannels() async {
    final androidImplementation = _plugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

    if (androidImplementation != null) {
      const orderChannel = AndroidNotificationChannel(
        _orderChannelId,
        _orderChannelName,
        description: _orderChannelDesc,
        importance: Importance.max,
        enableVibration: true,
        playSound: true,
      );

      const promoChannel = AndroidNotificationChannel(
        _promoChannelId,
        _promoChannelName,
        description: _promoChannelDesc,
        importance: Importance.high,
        enableVibration: true,
        playSound: true,
      );

      await androidImplementation.createNotificationChannel(orderChannel);
      await androidImplementation.createNotificationChannel(promoChannel);
    }
  }

  /// Handle notification tap when user clicks system notification in tray or lock screen
  void _onNotificationTapped(NotificationResponse response) {
    final payload = response.payload;
    debugPrint('🔔 [LocalNotificationService] Notification tapped with payload: $payload');

    if (payload != null && payload.isNotEmpty) {
      if (payload.startsWith('order_')) {
        final orderId = payload.replaceFirst('order_', '');
        Get.toNamed(AppRoutes.orderDetail, arguments: orderId);
        return;
      }
    }

    // Default: navigate to Notification Center
    Get.toNamed(AppRoutes.notifications);
  }

  /// Show a real native OS notification on Android & iOS
  Future<void> showNativeNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
    String type = 'system',
  }) async {
    try {
      final isOrder = type == 'order' || type == 'delivery';
      final channelId = isOrder ? _orderChannelId : _promoChannelId;
      final channelName = isOrder ? _orderChannelName : _promoChannelName;

      final androidDetails = AndroidNotificationDetails(
        channelId,
        channelName,
        importance: Importance.max,
        priority: Priority.high,
        styleInformation: BigTextStyleInformation(
          body,
          contentTitle: title,
        ),
        enableVibration: true,
        vibrationPattern: Int64List.fromList([0, 250, 200, 250]),
        color: const Color(0xFFFF6B00),
      );

      const darwinDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      final details = NotificationDetails(
        android: androidDetails,
        iOS: darwinDetails,
      );

      await _plugin.show(
        id: id,
        title: title,
        body: body,
        notificationDetails: details,
        payload: payload,
      );
      debugPrint('🔔 [LocalNotificationService] Native OS notification posted: "$title"');
    } catch (e) {
      debugPrint('⚠️ [LocalNotificationService] Failed to post native notification: $e');
    }
  }
}

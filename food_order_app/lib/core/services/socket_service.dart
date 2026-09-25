import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../constants/api_constants.dart';

/// Singleton service for managing Socket.IO connections
class SocketService {
  SocketService._();
  static final SocketService _instance = SocketService._();
  static SocketService get instance => _instance;

  io.Socket? _socket;
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  /// Connect to the Socket.IO server
  void connect() {
    if (_socket != null && _isConnected) return;

    final baseUrl = ApiConstants.baseUrl.replaceAll('/api', '').replaceAll(RegExp(r'/$'), '');
    debugPrint('🔌 [SocketService] Connecting to $baseUrl');

    _socket = io.io(
      baseUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(2000)
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
      debugPrint('🔌 [SocketService] Connected');
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      debugPrint('❌ [SocketService] Disconnected');
    });

    _socket!.onConnectError((error) {
      debugPrint('❌ [SocketService] Connection error: $error');
    });

    _socket!.connect();
  }

  /// Join an order room to receive driver location updates
  void joinOrder(String orderId) {
    if (_socket == null) connect();
    debugPrint('📍 [SocketService] Joining order room: $orderId');
    _socket?.emit('join_order', {'orderId': orderId});
  }

  /// Leave an order room
  void leaveOrder(String orderId) {
    debugPrint('👋 [SocketService] Leaving order room: $orderId');
    _socket?.emit('leave_order', {'orderId': orderId});
  }

  /// Listen for driver location updates
  void onDriverLocation(void Function(Map<String, dynamic> data) callback) {
    _socket?.on('driver_location', (data) {
      if (data is Map<String, dynamic>) {
        callback(data);
      } else if (data is Map) {
        callback(Map<String, dynamic>.from(data));
      }
    });
  }

  /// Listen for order status changes
  void onOrderStatusChanged(void Function(Map<String, dynamic> data) callback) {
    _socket?.on('order_status_changed', (data) {
      if (data is Map<String, dynamic>) {
        callback(data);
      } else if (data is Map) {
        callback(Map<String, dynamic>.from(data));
      }
    });
  }

  /// Listen for real-time push notifications
  void onPushNotification(void Function(Map<String, dynamic> data) callback) {
    _socket?.on('push_notification', (data) {
      if (data is Map<String, dynamic>) {
        callback(data);
      } else if (data is Map) {
        callback(Map<String, dynamic>.from(data));
      }
    });
  }

  /// Remove all listeners for a specific event
  void offDriverLocation() {
    _socket?.off('driver_location');
  }

  void offOrderStatusChanged() {
    _socket?.off('order_status_changed');
  }

  void offPushNotification() {
    _socket?.off('push_notification');
  }

  /// Disconnect from the server
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
    debugPrint('🔌 [SocketService] Disconnected & disposed');
  }
}

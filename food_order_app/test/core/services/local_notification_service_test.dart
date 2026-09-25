import 'package:flutter_test/flutter_test.dart';
import 'package:food_order_app/core/services/local_notification_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('LocalNotificationService Tests', () {
    test('Singleton instance is non-null', () {
      final service = LocalNotificationService.instance;
      expect(service, isNotNull);
    });

    test('showNativeNotification executes safely without crashing', () async {
      final service = LocalNotificationService.instance;

      // In testing environments without native platform channels, showNativeNotification
      // gracefully handles the MissingPluginException / platform channel exceptions.
      await service.showNativeNotification(
        id: 101,
        title: 'Order Delivered',
        body: 'Your pizza is here!',
        type: 'delivery',
        payload: 'order_123',
      );
    });
  });
}
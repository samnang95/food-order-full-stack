import 'package:flutter_test/flutter_test.dart';
import 'package:food_order_app/core/config/app_environment.dart';
import 'package:food_order_app/core/services/wakelock_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('WakelockService & AppConfig Tests', () {
    test('AppConfig.enableWakelock returns true for dev and false for prod', () {
      AppConfig.environment = AppEnvironment.dev;
      expect(AppConfig.enableWakelock, isTrue);

      AppConfig.environment = AppEnvironment.staging;
      expect(AppConfig.enableWakelock, isFalse);

      AppConfig.environment = AppEnvironment.prod;
      expect(AppConfig.enableWakelock, isFalse);

      // Reset
      AppConfig.environment = AppEnvironment.dev;
    });

    test('WakelockService methods execute gracefully without throwing in test environment', () async {
      // These call the platform channel wrapped in try-catch so they never crash
      await WakelockService.initialize();
      await WakelockService.enable();
      await WakelockService.disable();
      await WakelockService.toggle(on: true);
      await WakelockService.toggle(on: false);
      
      final isEnabled = await WakelockService.isEnabled;
      expect(isEnabled, isFalse);
    });
  });
}

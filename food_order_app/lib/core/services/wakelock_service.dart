import 'package:flutter/foundation.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import '../config/app_environment.dart';

class WakelockService {
  WakelockService._();

  static final WakelockService _instance = WakelockService._();
  static WakelockService get instance => _instance;

  /// Initializes wakelock based on the current environment configuration
  static Future<void> initialize() async {
    if (AppConfig.enableWakelock) {
      await enable();
    }
  }

  /// Enables the screen wakelock to prevent display sleep/auto-lock
  static Future<void> enable() async {
    try {
      await WakelockPlus.enable();
      debugPrint('💡 [WakelockService] Screen wakelock enabled');
    } catch (e) {
      debugPrint('⚠️ [WakelockService] Failed to enable wakelock: $e');
    }
  }

  /// Disables the screen wakelock allowing normal display sleep
  static Future<void> disable() async {
    try {
      await WakelockPlus.disable();
      debugPrint('💡 [WakelockService] Screen wakelock disabled');
    } catch (e) {
      debugPrint('⚠️ [WakelockService] Failed to disable wakelock: $e');
    }
  }

  /// Toggles the screen wakelock
  static Future<void> toggle({required bool on}) async {
    if (on) {
      await enable();
    } else {
      await disable();
    }
  }

  /// Checks if the screen wakelock is currently enabled
  static Future<bool> get isEnabled async {
    try {
      return await WakelockPlus.enabled;
    } catch (_) {
      return false;
    }
  }
}

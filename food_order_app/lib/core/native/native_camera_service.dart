import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

class NativeCameraService {
  NativeCameraService._();

  static final NativeCameraService _instance = NativeCameraService._();
  static NativeCameraService get instance => _instance;
  static const MethodChannel _channel = MethodChannel('com.bitecraft.app/camera');
  Future<bool> openCamera() async {
    try {
      final bool result = await _channel.invokeMethod('openCamera');
      return result;
    } on PlatformException catch (e) {
      if (kDebugMode) {
        print("Failed to open native camera: '${e.message}'.");
      }
      return false;
    }
  }
}
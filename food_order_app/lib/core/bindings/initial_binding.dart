import 'package:get/get.dart';

/// Global bindings for app-wide dependencies.
/// Note: ThemeStore is registered in main.dart before runApp
/// since it's needed to build the GetMaterialApp widget.
class InitialBinding extends Bindings {
  @override
  void dependencies() {
    // Register other global services here
  }
}

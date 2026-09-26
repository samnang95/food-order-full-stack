import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../db/local_db.dart';

class ThemeStore extends GetxController {
  static const String _themeKey = 'app_theme_mode';

  final Rx<ThemeMode> _themeMode = _getInitialTheme().obs;
  ThemeMode get themeMode => _themeMode.value;

  static ThemeMode _getInitialTheme() {
    final stored = LocalDB.getString(_themeKey);
    if (stored == 'light') return ThemeMode.light;
    if (stored == 'dark') return ThemeMode.dark;
    return ThemeMode.system;
  }

  bool isDarkMode(BuildContext context) {
    if (_themeMode.value == ThemeMode.dark) return true;
    if (_themeMode.value == ThemeMode.light) return false;
    return MediaQuery.platformBrightnessOf(context) == Brightness.dark;
  }

  void toggleTheme(BuildContext context) {
    final currentIsDark = isDarkMode(context);
    final newTheme = currentIsDark ? ThemeMode.light : ThemeMode.dark;

    _themeMode.value = newTheme;
    Get.changeThemeMode(newTheme);
    // Persist asynchronously without blocking switch animation
    LocalDB.setString(_themeKey, newTheme.name);
  }
}

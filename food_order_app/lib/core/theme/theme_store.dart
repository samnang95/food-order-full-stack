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

  Future<void> toggleTheme(BuildContext context) async {
    ThemeMode newTheme;
    if (_themeMode.value == ThemeMode.light) {
      newTheme = ThemeMode.dark;
    } else if (_themeMode.value == ThemeMode.dark) {
      newTheme = ThemeMode.light;
    } else {
      final isDark = MediaQuery.platformBrightnessOf(context) == Brightness.dark;
      newTheme = isDark ? ThemeMode.light : ThemeMode.dark;
    }
    
    _themeMode.value = newTheme;
    await LocalDB.setString(_themeKey, newTheme.name);
  }
}

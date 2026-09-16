import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../db/local_db.dart';

class ThemeStore extends Cubit<ThemeMode> {
  static const String _themeKey = 'app_theme_mode';

  ThemeStore() : super(_getInitialTheme());

  static ThemeMode _getInitialTheme() {
    final stored = LocalDB.getString(_themeKey);
    if (stored == 'light') return ThemeMode.light;
    if (stored == 'dark') return ThemeMode.dark;
    return ThemeMode.system;
  }

  Future<void> toggleTheme(BuildContext context) async {
    ThemeMode newTheme;
    if (state == ThemeMode.light) {
      newTheme = ThemeMode.dark;
    } else if (state == ThemeMode.dark) {
      newTheme = ThemeMode.light;
    } else {
      final isDark = MediaQuery.platformBrightnessOf(context) == Brightness.dark;
      newTheme = isDark ? ThemeMode.light : ThemeMode.dark;
    }
    
    emit(newTheme);
    await LocalDB.setString(_themeKey, newTheme.name);
  }
}
